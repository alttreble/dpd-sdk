import { sleepSync } from 'bun';
import { ElementType } from "domelementtype";
import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import { Project, Scope, ts } from 'ts-morph';
const res = await fetch("https://api.speedy.bg/api/docs/")
const text = await res.text()
const $ = cheerio.load(text);

const typeMatchMap = {
  string: ["string", "String"],
  int: ["int", "integer", "Int", "Long", "long", "Integer/td> ", "integer/td>"],
  double: ["double", "Double"],
  boolean: ["Boolean", "boolean"],
  datetime: ["Date", "date", "datetime"],
  enum: ["enum", "Enum"],
  array: ["[]"]
}

const schemaNameAlias = {
  ShipmentAdditionalServices: "ShipmentSubServices",
  AddressLocation: "CalculationAddressLocation",
  ShipmentReturnVoucherAdditionalService: "ShipmentReturnVoucherSubService",
  GoodsItem: "ShipmentParcelGoods"
}

function extractSection(titleText: string) {
  const header = $(`h1:contains("${titleText}")`);
  if (!header.length) throw new Error(`Section "${titleText}" not found.`);
  const section = [];
  let el = header.next();
  while (el.length && !el.is("h1")) {
    section.push(el);
    el = el.next();
  }
  return section;
}


function typeMatches(type: string, matches: keyof typeof typeMatchMap) {
  return typeMatchMap[matches]?.some((typeMatch) => type.includes(typeMatch))
}

function buildZonEnum(type: string) {
  const trimmed = type.trim()
  // Match multiline enum[] with embedded array in parentheses
  const enumArrayParenMatch = trimmed.match(
    /^enum\[\][\s\S]*?\(\s*array with values from enum:\s*\[\s*([^\]]+?)\s*\]\s*\)/i
  );
  if (enumArrayParenMatch) {
    const values = enumArrayParenMatch[1]
      ?.split(",")
      .map(v => v.trim().replace(/^"|"$/g, ""));
    return `z.array(z.enum([${values?.map(v => `"${v}"`).join(", ")}]))`;
  }

  // Match inline enum[]
  const enumArrayMatch = trimmed.match(/^enum\[\]\s*\[([^\]]+)\]/i);
  if (enumArrayMatch) {
    const values = enumArrayMatch[1]
      ?.split(",")
      .map(v => v.trim().replace(/^"|"$/g, ""));
    return `z.array(z.enum([${values?.map(v => `"${v}"`).join(", ")}]))`;
  }

  // Match basic enum or senum
  const enumMatch = trimmed.match(/^(enum|senum)\s*\[([^\]]+)\]/i);
  if (enumMatch) {
    const values = enumMatch[2]
      ?.split(",")
      .map(v => v.trim().replace(/^"|"$/g, ""));
    return `z.enum([${values?.map(v => `"${v}"`).join(", ")}])`;
  }
  throw Error(`Type "${type}" is not a valid enum`)
}

function mapTypeToZod(type: string): string {
  if (typeMatches(type, "enum")) return buildZonEnum(type);
  if (typeMatches(type, "array")) {
    const innerType = type.slice(0, -2).trim(); // remove trailing []
    return `z.array(${mapTypeToZod(innerType)})`;
  }
  if (typeMatches(type, "string")) return "z.string()";
  if (typeMatches(type, "int")) return "z.number().int()";
  if (typeMatches(type, "double")) return "z.number()";
  if (typeMatches(type, "boolean")) return "z.boolean()";
  if (typeMatches(type, "datetime")) return "z.string().datetime()";

  return schemaNameAlias[type] ? schemaNameAlias[type] : type
}

type SchemaFields = Record<string, SchemaField[]>
type SchemaField = {
  name: string
  type: string
  description?: string
}

function extractSchemas(sectionElements: cheerio.Cheerio<Element>[]) {
  const schemas: SchemaFields = {};
  sectionElements.forEach((el) => {
    if (!el.is("table")) return;

    const rows = el.find("tr").toArray();
    if (rows.length < 3) return; // must have header and at least two rows

    const schemaName = $(rows[0]).text().trim().replaceAll(" ", "");
    if (!schemaName) return;

    const fieldRows = rows.slice(2); // skip the first row (which holds the title)
    const fields = fieldRows.map((row) => {
      const cols = $(row).find("td");
      return {
        name: $(cols[0]).text().trim(),
        type: $(cols[1]).text().trim(),
        description: $(cols[2]).text().trim()
      } as SchemaField;
    });

    schemas[schemaName] = fields;
  });

  return schemas;
}

function renderZodSchemaField(field: SchemaField) {
  return `  ${field.name}: ${mapTypeToZod(field.type)},`

}

function renderZodSchemaSpread(field: SchemaField) {
  return `  ...${field.name.replace(" fields are here", "")}.shape,`
}
function renderZodSchema(name: string, fields: SchemaField[]) {
  const lines = [`export const ${name} = z.object({`];
  fields.forEach(f => {
    if (f.name.includes(" fields are here")) {
      lines.push(renderZodSchemaSpread(f))
    } else {
      lines.push(renderZodSchemaField(f));
    }

  });
  lines.push("});");
  return lines.join("\n");
}

type ServiceMethod = {
  name: string;
  input: string;
  response: string;
  endpoint: string;
}

type Service = {
  name: string;
  section: string;
  methods: ServiceMethod[];
}
function toPascalCase(str: string): string {
  return str
    .replace(/(?:^|[-_])(\w)/g, (_, c) => c ? c.toUpperCase() : '')
    .replace(/[^A-Za-z0-9]/g, ''); // Remove any non-alphanumeric characters
}

function toCamelCase(str: string): string {
  return str
    .replace(/(?:^|[-_])(\w)/g, (_, c) => c ? c.toLowerCase() : '')
    .replace(/[^A-Za-z0-9]/g, ''); // Remove any non-alphanumeric characters
}

function extractServiceMethods(service: Service, section: cheerio.Cheerio<Element>[]) {
  // <h3 id="href-add-parcel-req">2.1.3.1. Add parcel Request (AddParcelRequest)</h3>
  // Parcels can be added to shipments in pending parcels state (shipments created with pendingParcels flag true)
  //
  // <br><span class="spanWebService">Web service URL:</span> BASE_URL/shipment/add_parcel
  // <br><span class="spanMethod">Method:</span> POST<br>
  // <span class="spanContentType">Content-type:</span> application/json; <span class="spanCharset">charset</span>=utf-8<br>
  //
  //
  //
  // <table class="tableDataStructure5">
  // ...
  // </table>
  //
  //
  // <h3 id="href-add-parcel-resp">2.1.3.2. Add Parcel Response (AddParcelResponse)</h3>
  // Add parcel response returns generated parcel. Otherwise, an error is included.
  // <table class="tableDataStructure3">
  // ...
  // </table>
  const methods: ServiceMethod[] = [];
  section.forEach((el) => {
    if (!el.is("h3")) return; // Only process h3 elements
    const headerText = $(el).text().trim();
    if (
      !headerText.startsWith(service.section) ||
      (headerText.match(/\./g) || []).length < 3 ||
      !headerText.includes("Request")

    ) return;

    let methodName = headerText.split(" ").slice(1).join(" "); // Get the method name (e.g., "AddParcelRequest")
    // Grab only the name in the parentheses if it exists and remove the "Request" or "Response" suffix
    methodName = methodName.replace(/\s*\(.*?\)/, "").replace(/Request$/, "").trim();
    if (!methodName) return; // Skip if no method name found

    let node = el[0]?.nextSibling;
    let endpoint = ""

    while (node && node.name != "h3") {
      if (node && node?.type === ElementType.Text) {
        console.log(node.data.trim())
        if (node.data.trim().startsWith("BASE_URL")) {
          endpoint = node.data.trim();
          break;
        }
      }
      node = el[0]?.nextSibling;
    }
    sleepSync(3000)

    methods.push({
      name: toCamelCase(methodName),
      input: "any",
      response: "any",
      endpoint
    });
  });


  service.methods = methods;
}
/**
  * Extracts services from section 2 of the API documentation.
  * The services are defined on a 2.x level of the documentation.
  * @param section2 - The section 2 elements containing service definitions.
  * @return An object mapping service names to their schemas.
  */
function extractServices(section: cheerio.Cheerio<Element>[], serviceSchemas: SchemaFields): Service[] {
  const services: Service[] = []
  section.forEach((el) => {
    if (!el.is("h3")) return; // Only process h2 elements
    // Process only h3 elements that start with "2.1 " and not any deeper levels like 2.1.1

    const headerText = $(el).text().trim();
    // Skip if the header does have more than 2 dots in the first word"
    if ((headerText.match(/\./g) || []).length > 2) return;
    // Drop the first part of the header text, which is "2.1 " The second part might contain multiple words
    const serviceName = headerText.split(" ").slice(1).join(" ").trim();

    if (!serviceName) return; // Skip if no service name found
    services.push({
      name: serviceName,
      section: headerText.split(" ")[0]!, // Keep the section number (e.g., "2.1")
      methods: []
    });
  });
  for (const service of services) {
    extractServiceMethods(service, section); // Extract methods for the first service
  }
  console.log("Extracted services:", services);



  return services;
}

const section2 = extractSection("2. Overall Description");
const section3 = extractSection("3. Data Structures");
const serviceSchemas = extractSchemas(section2);
const services = extractServices(section2, serviceSchemas)
const dataSchemas = extractSchemas(section3);

// Generate Zod schema source
const output = [
  `import { z } from "zod";`,

  ...Object.entries(serviceSchemas).map(([name, fields]) => renderZodSchema(name, fields)),
  ...Object.entries(dataSchemas).map(([name, fields]) => renderZodSchema(name, fields)),
].join("\n\n");

Bun.write("schema.ts", output);


const outDir = './services';

const project = new Project();

// For each service, create a file
for (const service of services) {
  const className = service.name.replace(/\s+/g, "");
  const fileName = toCamelCase(service.name) + ".ts";

  const sourceFile = project.createSourceFile(`${outDir}/${fileName}`, "", {
    overwrite: true,
  });

  sourceFile.addImportDeclaration({
    namedImports: ["Context"],
    moduleSpecifier: "../context",
    isTypeOnly: true,
  });

  sourceFile.addClass({
    name: className,
    isExported: true,
    ctors: [{
      parameters: [{ name: "context", type: "Context" }],
      statements: [
        `this.context = context;`,
      ],
    }],
    properties: [{
      name: "context",
      type: "Context",
      scope: Scope.Private,
    }],
    methods: service.methods.map((method) => ({
      name: method.name,
      parameters: [{ name: "input", type: method.input }],
      returnType: method.response,
      statements: [
        `// endpoint: ${method.endpoint}`,
        `console.log("Calling ${method.name} with", input);`,
        `return {} as ${method.response};`,
      ],
    })),
  });

  const contents = sourceFile.getFullText();
  await Bun.write(`${outDir}/${fileName}`, contents);
}

console.log("✅ Service clients generated in `services/`");

function toImportPath(name: string) {
  return `./services/${toCamelCase(name)}`;
}

const indexFile = project.addSourceFileAtPath("index.ts");
const clientClass = indexFile.getClassOrThrow("DPDClient");
const ctor = clientClass.getConstructors()[0];

if (!ctor) {
  throw new Error("DPDClient class does not have a constructor");
}

const contextInit = ctor.getBodyOrThrow().getDescendantsOfKind(ts.SyntaxKind.ExpressionStatement).find((stmt) =>
  stmt.getText().includes("this.context =")
);

// Add imports for each service
for (const service of services) {
  const fieldName = toCamelCase(service.name);
  const className = toPascalCase(service.name);
  const importPath = toImportPath(service.name);

  const existing = indexFile.getImportDeclaration((i) => i.getModuleSpecifierValue() === importPath);
  if (!existing) {
    indexFile.addImportDeclaration({
      namedImports: [className],
      moduleSpecifier: importPath,
    });
  }

  if (!clientClass.getProperty(fieldName)) {
    clientClass.addProperty({
      name: fieldName,
      type: className,
      scope: Scope.Public
    });
  }

  if (!ctor.getBodyOrThrow().getText().includes(`this.${fieldName} =`)) {
    const newStatement = `this.${fieldName} = new ${className}(this.context);`
    ctor.insertStatements(1, newStatement);
  }
}

await indexFile.save()
