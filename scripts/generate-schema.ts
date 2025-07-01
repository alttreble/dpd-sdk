import * as cheerio from 'cheerio';
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

function extractSchemas(sectionElements) {
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

// ---- Run Extraction ----

const section3 = extractSection("3. Data Structures");
const schemas = extractSchemas(section3);

// Generate Zod schema source
const output = [
  `import { z } from "zod";\n`,
  ...Object.entries(schemas).map(([name, fields]) => renderZodSchema(name, fields))
].join("\n\n");

Bun.write("generated.ts", output);
