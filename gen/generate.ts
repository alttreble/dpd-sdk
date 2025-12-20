import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import { CodeBlockWriter, Project, Scope, StructureKind } from 'ts-morph';
import { ConsoleLogger, type Logger } from '../logger';

/**
 * Map of schema name to the schema
 * For example:
 * {
 *   "Sender": {
 *      fields: [ ... ],
 *      extends: "Client"
 *    }
 * }
 **/
type SchemaMap = Record<string, Schema>
type Schema = {
  fields: SchemaField[]
  extends?: string
}

type SchemaField = {
  name: string
  type: string
  required?: string;
  description?: string
  constraints?: string
}

type ColumnKey = "name" | "type" | "required" | "description" | "constraints";

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

const typeMatchMap = {
  string: ["string", "String"],
  int: ["int", "integer", "Int", "Long", "long", "Integer/td> ", "integer/td>"],
  double: ["double", "Double"],
  boolean: ["Boolean", "boolean"],
  datetime: ["Date", "date", "datetime"],
  enum: ["enum", "Enum"],
  array: ["[]"]
} as const;

const schemaNameAlias: Record<string, string> = {
  ShipmentAdditionalServices: "ShipmentSubServices",
  AddressLocation: "CalculationAddressLocation",
  ShipmentReturnVoucherAdditionalService: "ShipmentReturnVoucherSubService",
  GoodsItem: "ShipmentParcelGoods"
}

const newLine = '\n';

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

function typeMatches(type: string, matches: keyof typeof typeMatchMap) {
  return (typeMatchMap[matches] ?? []).some((m) => type.includes(m));
}

function parseEnumValues(type: string): { values: string[]; isArray: boolean } | null {
  const trimmed = type.trim();

  // enum[] with parentheses "array with values from enum: [..]"
  const enumArrayParenMatch = trimmed.match(
    /^enum\[\][\s\S]*?\(\s*array with values from enum:\s*\[\s*([^\]]+?)\s*\]\s*\)/i
  );
  if (enumArrayParenMatch) {
    const values = (enumArrayParenMatch[1] || "")
      .split(",")
      .map((v) => v.trim().replace(/^"|"$/g, ""))
      .filter(Boolean);
    return { values, isArray: true };
  }

  // inline enum[]
  const enumArrayMatch = trimmed.match(/^enum\[\]\s*\[([^\]]+)\]/i);
  if (enumArrayMatch) {
    const values = (enumArrayMatch[1] || "")
      .split(",")
      .map((v) => v.trim().replace(/^"|"$/g, ""))
      .filter(Boolean);
    return { values, isArray: true };
  }

  // enum / senum
  const enumMatch = trimmed.match(/^(enum|senum)\s*\[([^\]]+)\]/i);
  if (enumMatch) {
    const values = (enumMatch[2] || "")
      .split(",")
      .map((v) => v.trim().replace(/^"|"$/g, ""))
      .filter(Boolean);
    return { values, isArray: false };
  }

  return null;
}

/**
 * Returns a TypeNode writer for ts-morph.
 * We use writers so we can emit unions/intersections/arrays cleanly.
 */
function mapTypeToTypeNode(type: string) {
  const raw = (type ?? "").trim();
  if (!raw) return (writer: CodeBlockWriter) => writer.write("unknown");

  // enum => string literal union (optionally array)
  if (typeMatches(raw, "enum")) {
    const parsed = parseEnumValues(raw);
    if (!parsed) throw new Error(`Type "${type}" is not a valid enum`);
    return (writer: CodeBlockWriter) => {
      // ("A" | "B" | "C") or ("A" | "B")[]
      writer.write("(");
      parsed.values.forEach((v, i) => {
        if (i > 0) writer.write(" | ");
        writer.quote(v);
      });
      writer.write(")");
      if (parsed.isArray) writer.write("[]");
    };
  }

  // arrays like "Foo[]"
  if (typeMatches(raw, "array")) {
    const inner = raw.slice(0, -2).trim();
    const innerNode = mapTypeToTypeNode(inner);
    return (writer: CodeBlockWriter) => {
      writer.write("(");
      innerNode(writer);
      writer.write(")[]");
    };
  }

  if (typeMatches(raw, "string")) return (w: CodeBlockWriter) => w.write("string");
  if (typeMatches(raw, "int")) return (w: CodeBlockWriter) => w.write("number");
  if (typeMatches(raw, "double")) return (w: CodeBlockWriter) => w.write("number");
  if (typeMatches(raw, "boolean")) return (w: CodeBlockWriter) => w.write("boolean");
  if (typeMatches(raw, "datetime")) return (w: CodeBlockWriter) => w.write("string");

  // schema reference
  const ref = schemaNameAlias[raw] ?? raw;
  return (w: CodeBlockWriter) => w.write(ref);
}

function isOptional(field: SchemaField): boolean {
  if (!field.required) return true; // default to optional
  return field.required.trim().toLowerCase() !== "yes";
}

// function extractServiceMethods(service: Service, section: cheerio.Cheerio<Element>[]) {
//   // <h3 id="href-add-parcel-req">2.1.3.1. Add parcel Request (AddParcelRequest)</h3>
//   // Parcels can be added to shipments in pending parcels state (shipments created with pendingParcels flag true)
//   //
//   // <br><span class="spanWebService">Web service URL:</span> BASE_URL/shipment/add_parcel
//   // <br><span class="spanMethod">Method:</span> POST<br>
//   // <span class="spanContentType">Content-type:</span> application/json; <span class="spanCharset">charset</span>=utf-8<br>
//   //
//   //
//   //
//   // <table class="tableDataStructure5">
//   // ...
//   // </table>
//   //
//   //
//   // <h3 id="href-add-parcel-resp">2.1.3.2. Add Parcel Response (AddParcelResponse)</h3>
//   // Add parcel response returns generated parcel. Otherwise, an error is included.
//   // <table class="tableDataStructure3">
//   // ...
//   // </table>
//   const methods: ServiceMethod[] = [];
//   section.forEach((el) => {
//     if (!el.is("h3")) return; // Only process h3 elements
//     const headerText = $(el).text().trim();
//     if (
//       !headerText.startsWith(service.section) ||
//       (headerText.match(/\./g) || []).length < 3 ||
//       !headerText.includes("Request")
//
//     ) return;
//
//     let methodName = headerText.split(" ").slice(1).join(" "); // Get the method name (e.g., "AddParcelRequest")
//     // Grab only the name in the parentheses if it exists and remove the "Request" or "Response" suffix
//     methodName = methodName.replace(/\s*\(.*?\)/, "").replace(/Request$/, "").trim();
//     if (!methodName) return; // Skip if no method name found
//
//     let node = el[0]?.nextSibling;
//     let endpoint = ""
//
//     while (node && node.name != "h3") {
//       if (node && node?.type === ElementType.Text) {
//         console.log(node.data.trim())
//         if (node.data.trim().startsWith("BASE_URL")) {
//           endpoint = node.data.trim();
//           break;
//         }
//       }
//       node = el[0]?.nextSibling;
//     }
//     sleepSync(3000)
//
//     methods.push({
//       name: toCamelCase(methodName),
//       input: "any",
//       response: "any",
//       endpoint
//     });
//   });
//
//
//   service.methods = methods;
// }

// const section2 = extractSection("2. Overall Description");
// const section3 = extractSection("3. Data Structures");
// const serviceSchemas = extractSchemas(section2);
// const services = extractServices(section2, serviceSchemas)
// const dataSchemas = extractSchemas(section3);

//
// function toImportPath(name: string) {
//   return `./services/${toCamelCase(name)}`;
// }
//
// const indexFile = project.addSourceFileAtPath("index.ts");
// const clientClass = indexFile.getClassOrThrow("DPDClient");
// const ctor = clientClass.getConstructors()[0];
//
// if (!ctor) {
//   throw new Error("DPDClient class does not have a constructor");
// }
//
// const contextInit = ctor.getBodyOrThrow().getDescendantsOfKind(ts.SyntaxKind.ExpressionStatement).find((stmt) =>
//   stmt.getText().includes("this.context =")
// );
//
// // Add imports for each service
// for (const service of services) {
//   const fieldName = toCamelCase(service.name);
//   const className = toPascalCase(service.name);
//   const importPath = toImportPath(service.name);
//
//   const existing = indexFile.getImportDeclaration((i) => i.getModuleSpecifierValue() === importPath);
//   if (!existing) {
//     indexFile.addImportDeclaration({
//       namedImports: [className],
//       moduleSpecifier: importPath,
//     });
//   }
//
//   if (!clientClass.getProperty(fieldName)) {
//     clientClass.addProperty({
//       name: fieldName,
//       type: className,
//       scope: Scope.Public
//     });
//   }
//
//   if (!ctor.getBodyOrThrow().getText().includes(`this.${fieldName} =`)) {
//     const newStatement = `this.${fieldName} = new ${className}(this.context);`
//     ctor.insertStatements(1, newStatement);
//   }
// }
//
// await indexFile.save()

class APIDocGenerator {
  private apiUrl: string;
  private apiDoc: cheerio.CheerioAPI;
  private project = new Project();

  constructor(
    apiUrl: string = "https://api.speedy.bg/api/docs/",
    private readonly logger: Logger = new ConsoleLogger(),
  ) {
    this.apiUrl = apiUrl;
    this.apiDoc = cheerio.load("") // Initialize with empty content, will be set in init()
  }

  /**
   * Generates TypeScript client code based on the API documentation.
   */
  generate() {
    const dataStructuresSection = this.extractSection("3. Data Structures");
    const schemaMap = this.extractSchemas(dataStructuresSection);
    this.writeSchemaFile(schemaMap)
  }

  /**
    * Extracts services from section 2 of the API documentation.
    * The services are defined at a 2.x level of the documentation.
    * @return An object mapping service names to their schemas.
    */
  extractServices(): Service[] {
    const servicesSection = this.extractSection("2. Overall Description");
    const services: Service[] = []
    servicesSection.forEach((el) => {
      if (!el.is("h3")) return; // Only process h2 elements
      // Process only h3 elements that start with "2.1 " and not any deeper levels like 2.1.1

      const headerText = this.apiDoc(el).text().trim();
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
      // extractServiceMethods(service, servicesSection); // Extract methods for the first service
    }
    this.logger.info("Extracted services:", services);

    return services;
  }

  async writeServies(services: Service[]) {
    const outDir = './services';
    // For each service, create a file
    for (const service of services) {
      const className = service.name.replace(/\s+/g, "");
      const fileName = toCamelCase(service.name) + ".ts";

      const sourceFile = this.project.createSourceFile(`${outDir}/${fileName}`, "", {
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
  }

  /**
   * Every request, response and data schema in the API is defined in its own table.
   * The first table row contains the schema name.
   * The subsequent rows contain the fields.
   *
   * Extracts all schemas from the given section of the documentation.
   * @param section - The section elements to extract schemas from. For example, section 3.
   * @return An object mapping of the schema name to the schema.
   */
  extractSchemas(section: cheerio.Cheerio<Element>[]) {
    const schemaMap: SchemaMap = {};

    section.forEach((el) => {
      if (!el.is("table")) return;

      const rows = el.find("tr").toArray();
      if (rows.length < 3) return; // must have header and at least two rows

      // Row 0: contains the schema name
      const schemaName = this.apiDoc(rows[0]).text().trim().replaceAll(" ", "");
      if (!schemaName) return;

      // Row 1: column headers
      const headerRow = this.apiDoc(rows[1]).find("td").toArray();
      const colIndex = this.buildSchemaTableColumnIndex(headerRow);

      // If we can't even find a "name" or "type" columns, we can't parse fields reliably.
      if (colIndex.name == null || colIndex.type == null) return;

      const fields: SchemaField[] = [];
      let schemaExtends: string | undefined;

      for (const row of rows.slice(2)) {
        const $row = this.apiDoc(row);
        const cols = $row.find("td").toArray();

        // Special case: "extends another table" row (often a single <td> with a link)
        // See: https://api.dpd.ro/api/docs/#href-ds-recipient
        if (cols.length === 1) {
          const $cell = this.apiDoc(cols[0]);
          const cellText = $cell.text().trim().toLowerCase();
          if (!cellText) continue;

          // Heuristic: treat as "extends" if it mentions "fields are here"
          if (cellText.includes("fields are here")) {
            schemaExtends = $cell.text().trim().split(" ")[0]; // Get the referenced schema name
          }
          // Otherwise ignore single-cell non-field rows.
          continue;
        }

        const pick = (key: ColumnKey): string => {
          const idx = colIndex[key];
          if (idx == null) return "";
          if (idx < 0 || idx >= cols.length) return "";
          return this.apiDoc(cols[idx]).text().trim();
        };

        const name = pick("name");
        const type = pick("type");
        if (!name || !type) continue; // skip empty rows

        const field: SchemaField = { name, type };

        const required = pick("required");
        if (required) field.required = required;

        const desc = pick("description");
        if (desc) field.description = desc;

        const constraints = pick("constraints");
        if (constraints) field.constraints = constraints;

        fields.push(field);
      }
      schemaMap[schemaName] = { fields, extends: schemaExtends };
    });

    return schemaMap;
  }

  writeSchemaFile(...schemas: SchemaMap[]) {
    const outPath = './schema.ts';

    const merged: SchemaMap = Object.assign({}, ...schemas);
    const names = Object.keys(merged);

    const schemaFile = this.project.createSourceFile(outPath, "", { overwrite: true });

    schemaFile.addStatements([
      `// Generated TypeScript types (no runtime validation)`,
    ]);

    for (const name of names) {
      const schema = merged[name];
      if (!schema) continue;
      const parent = schema?.extends ? this.normalizeSchemaRef(schema.extends) : null;

      // Build `{ ... }` as a TypeLiteral writer
      const typeLiteral = (writer: CodeBlockWriter) => {
        writer.write("{").newLine();
        for (const field of schema.fields) {
          // JSDoc
          const docParts: string[] = [];
          if (field.description?.trim()) docParts.push(field.description.trim());
          if (field.constraints?.trim()) docParts.push(`Constraints: ${field.constraints.trim()}`);

          if (docParts.length) {
            writer.writeLine(`  /** ${docParts.join(" ")} */`);
          }

          // Property name (quote if needed)
          const propName = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(field.name.trim())
            ? field.name.trim()
            : JSON.stringify(field.name.trim());

          // Optional flag
          const opt = isOptional(field) ? "?" : "";

          // Type
          const fieldType = mapTypeToTypeNode(field.type);

          writer.write(`  ${propName}${opt}: `);
          fieldType(writer);
          writer.write(";");
        }
        writer.write("}");
      };

      // Final type: Parent & { ... } OR just { ... }
      const finalType = parent
        ? (writer: CodeBlockWriter) => {
          writer.write(`${parent} & `);
          typeLiteral(writer);
        }
        : typeLiteral;

      schemaFile.addTypeAlias({
        kind: StructureKind.TypeAlias,
        isExported: true,
        name,
        type: finalType,
      });
    }
    schemaFile.formatText({ ensureNewLineAtEndOfFile: true });

    Bun.write(outPath, schemaFile.getFullText());

  }

  /**
   * Builds an index mapping of schema table column headers to their respective column indices.
   *
   * Some tables may have columns in different orders or with different header names.
   * This function normalizes the header names and maps them to our expected column keys.
   *
   * For example a table header row like:
   * | Name | Type | Description | Required |
   * would map to:
   * {
   *  name: 0,
   *  type: 1,
   *  description: 2,
   *  required: 3
   * }
   *
   * Handles synonyms for headers as well, e.g. "Mandatory" for "Required".
   *
   * @param headerCells - An array of Cheerio elements representing the header cells of the schema table.
   * @return A mapping of column keys to their respective indices in the table.
   */
  private buildSchemaTableColumnIndex(headerCells: Element[]): Partial<Record<ColumnKey, number>> {
    const index: Partial<Record<ColumnKey, number>> = {};

    headerCells.forEach((cell, i) => {
      const raw = this.apiDoc(cell).text();
      const norm = this.normalizeHeader(raw);

      // Map header text -> our SchemaField properties
      // (Extend these synonyms as needed.)
      if (norm === "name") index.name = i;
      else if (norm === "type") index.type = i;
      else if (norm === "required" || norm === "mandatory") index.required = i;
      else if (norm === "data" || norm === "description" || norm === "details") index.description = i;
      else if (norm === "constraints" || norm === "constraint" || norm === "validation") index.constraints = i;
    });

    return index;
  }

  /**
    * The API documentation is structured with h1 headers for sections.
    * For example, "2. Overall Description", "3. Data Structures", etc.
    * Each one of these sections is defined by an h1 header
    *
    * Extracts a section from the API documentation based on the title text.
    * @param titleText - The title text of the section to extract.
    * @return An array of Cheerio elements representing the section content.
    */
  extractSection(titleText: string) {
    this.assertGeneratorInitialized();

    const header = this.apiDoc(`h1:contains("${titleText}")`);
    if (!header.length) throw new Error(`Section "${titleText}" not found.`);
    const section = [];
    let el = header.next();
    while (el.length && !el.is("h1")) {
      section.push(el);
      el = el.next();
    }
    return section;
  }

  assertGeneratorInitialized() {
    if (!this.apiDoc) {
      throw new Error("API documentation not initialized. Call init() first.");
    }
  }

  /**
   * Initializes the API documentation by fetching and parsing the HTML content.
   */
  async init() {
    const res = await fetch(this.apiUrl);
    const text = await res.text()
    const $ = cheerio.load(text);
    this.apiDoc = $;
    return this;
  }

  private normalizeHeader(s: string): string {
    // normalize whitespace + punctuation; compare in lowercase
    return s
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[^a-z ]/g, "")
      .replace(/\s/g, "");
  }

  private normalizeSchemaRef(name: string): string {
    const trimmed = name.trim().replaceAll(" ", "");
    return schemaNameAlias[trimmed] ?? trimmed;
  }
}

new APIDocGenerator().init().then((gen) => {
  gen.generate();
});
