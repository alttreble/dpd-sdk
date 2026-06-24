import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import { stringify as stringifyYaml } from 'yaml';
import type { OpenAPIV3_1 } from 'openapi-types';
import { ConsoleLogger, type Logger } from '../logger';
import { DocsNormalizer } from './docs-normalizer';

export interface DocsProvider {
  getDocs(): string | Promise<string>;
}

export class FetchDocsProvider implements DocsProvider {
  constructor(
    private readonly url: string = "https://api.speedy.bg/api/docs/",
    private readonly normalizer = new DocsNormalizer(),
  ) { }

  async getDocs(): Promise<string> {
    const res = await fetch(this.url);
    const text = await res.text()

    return this.normalizer.normalize(text);
  }
}

/** Reads the documentation from a local HTML file (useful for deterministic, offline generation). */
export class FileDocsProvider implements DocsProvider {
  constructor(
    private readonly filePath: string,
    private readonly normalizer = new DocsNormalizer(),
  ) { }

  async getDocs(): Promise<string> {
    const raw = await Bun.file(this.filePath).text();
    return this.normalizer.normalize(raw);
  }
}

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

/**
 * A single HTTP route for a service method. Most methods have exactly one route,
 * but some document alternatives (e.g. Cancel Shipment is "POST /shipment/cancel"
 * OR "DELETE /shipment"), so a method can expose more than one.
 */
export type ServiceRoute = {
  endpoint: string;
  method: string;
  contentType?: string;
}

export type ServiceMethod = {
  name: string;
  request: string;
  response: string;
  routes: ServiceRoute[];
}

export type Service = {
  name: string;
  section: string;
  methods: ServiceMethod[];
  // The base url that each method's url should start with.
  // In some cases a method might not specify an endpoint url,
  // so we inherit the base url from the service
  baseUrl: string
}

type OpenApiSchema = OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;

const typeMatchMap = {
  string: ["string", "String"],
  int: ["int", "integer", "Int", "Long", "long", "Integer/td> ", "integer/td>"],
  double: ["double", "Double"],
  boolean: ["Boolean", "boolean"],
  datetime: ["Date", "date", "datetime"],
  byte: ["byte", "Byte"],
  enum: ["enum", "Enum"],
  array: ["[]"]
} as const;

const schemaNameAlias: Record<string, string> = {
  ShipmentAdditionalServices: "ShipmentSubServices",
  AddressLocation: "CalculationAddressLocation",
  ShipmentReturnVoucherAdditionalService: "ShipmentReturnVoucherSubService",
  GoodsItem: "ShipmentParcelGoods"
}

function toCamelCase(str: string): string {
  return str
    .replace(/(?:^|[-_])(\w)/g, (_, c) => c ? c.toLowerCase() : '')
    .replace(/[^A-Za-z0-9]/g, ''); // Remove any non-alphanumeric characters
}

function capitalize(str: string): string {
  const words = str.split(" ");

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    if (!word) continue
    words[i] = word.charAt(0).toUpperCase() + word.substring(1);
  }

  return words.join(" ")

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

function refTo(name: string): string {
  const normalized = schemaNameAlias[name.trim().replaceAll(" ", "")] ?? name.trim().replaceAll(" ", "");
  return `#/components/schemas/${normalized}`;
}

/**
 * Maps a documentation type string to an OpenAPI 3.1 Schema Object.
 * Handles primitives, enums (as string literal `enum`s), arrays and references
 * to other schemas (`$ref`).
 */
function mapTypeToOpenApiSchema(type: string): OpenApiSchema {
  const raw = (type ?? "").trim();
  if (!raw) return {};

  // enum => string with an `enum` list (optionally wrapped in an array)
  if (typeMatches(raw, "enum")) {
    const parsed = parseEnumValues(raw);
    if (!parsed) throw new Error(`Type "${type}" is not a valid enum`);
    const enumSchema: OpenApiSchema = { type: "string", enum: parsed.values };
    return parsed.isArray ? { type: "array", items: enumSchema } : enumSchema;
  }

  // arrays like "Foo[]"
  if (typeMatches(raw, "array")) {
    const inner = raw.slice(0, -2).trim();
    return { type: "array", items: mapTypeToOpenApiSchema(inner) };
  }

  if (typeMatches(raw, "byte")) return { type: "string", format: "byte" };
  if (typeMatches(raw, "string")) return { type: "string" };
  if (typeMatches(raw, "int")) return { type: "integer", format: "int64" };
  if (typeMatches(raw, "double")) return { type: "number", format: "double" };
  if (typeMatches(raw, "boolean")) return { type: "boolean" };
  if (typeMatches(raw, "datetime")) {
    // The docs distinguish "Date (date)" from "Date (datetime)".
    const format = /datetime/i.test(raw) ? "date-time" : "date";
    return { type: "string", format };
  }

  // Otherwise it's a reference to another schema.
  return { $ref: refTo(raw) };
}

function isOptional(field: SchemaField): boolean {
  if (!field.required) return true; // default to optional
  return field.required.trim().toLowerCase() !== "yes";
}

/**
 * Converts a parsed `Schema` into an OpenAPI 3.1 Schema Object.
 * Schemas that extend another are emitted as an `allOf` of the parent `$ref`
 * and the schema's own properties.
 */
function buildSchemaObject(schema: Schema): OpenApiSchema {
  const properties: Record<string, OpenApiSchema> = {};
  const required: string[] = [];

  for (const field of schema.fields) {
    const propSchema = mapTypeToOpenApiSchema(field.type);

    const docParts: string[] = [];
    if (field.description?.trim()) docParts.push(field.description.trim());
    if (field.constraints?.trim()) docParts.push(`Constraints: ${field.constraints.trim()}`);
    if (docParts.length) {
      // Sibling keywords next to `$ref` are valid in OpenAPI 3.1 (JSON Schema 2020-12).
      (propSchema as { description?: string }).description = docParts.join(" ");
    }

    properties[field.name] = propSchema;
    if (!isOptional(field)) required.push(field.name);
  }

  const objectSchema: OpenAPIV3_1.SchemaObject = { type: "object", properties };
  if (required.length) objectSchema.required = required;

  if (schema.extends) {
    return { allOf: [{ $ref: refTo(schema.extends) }, objectSchema] };
  }
  return objectSchema;
}

export class APIGenerator {
  apiDoc: cheerio.CheerioAPI;

  constructor(
    private readonly docsProvider: DocsProvider = new FetchDocsProvider(),
    private readonly logger: Logger = new ConsoleLogger(),
  ) {
    this.apiDoc = cheerio.load("") // Initialize with empty content, will be set in init()
  }

  /**
   * Generates an OpenAPI 3.1 schema (YAML) from the API documentation.
   */
  async generate(outPath = "./openapi.yaml", version = "0.0.0") {
    const doc = this.buildOpenApiDocument(version);
    await Bun.write(outPath, stringifyYaml(doc));
    this.logger.info(`Wrote OpenAPI schema (version ${version}) to ${outPath}`);
    return doc;
  }

  /**
   * Builds the in-memory OpenAPI 3.1 document from the documentation:
   * services + their methods become `paths`, and all data/request/response
   * structures become `components.schemas`.
   *
   * @param version Value for `info.version` (derived from the changelog feed date).
   */
  buildOpenApiDocument(version = "0.0.0"): OpenAPIV3_1.Document {
    const services = this.extractServices();
    const schemas: SchemaMap = {
      ...this.extractDataStructuresSchemas(),
      ...this.extractRequestResponseSchemas(),
    };

    const definedSchemas = new Set(Object.keys(schemas));

    const paths: OpenAPIV3_1.PathsObject = {};
    for (const service of services) {
      for (const method of service.methods) {
        const multiRoute = method.routes.length > 1;
        for (const route of method.routes) {
          const pathItem = (paths[route.endpoint] ??= {}) as Record<string, OpenAPIV3_1.OperationObject>;
          const mediaType = (route.contentType ?? "application/json").split(";")[0]!.trim();

          const successResponse: OpenAPIV3_1.ResponseObject = { description: "Successful response" };
          // Some responses are CSV/PDF files with no documented schema — emit the
          // 200 without a body schema rather than a dangling $ref.
          if (definedSchemas.has(method.response)) {
            successResponse.content = { "application/json": { schema: { $ref: refTo(method.response) } } };
          }

          const operation: OpenAPIV3_1.OperationObject = {
            tags: [service.name],
            operationId: multiRoute ? `${method.name}${capitalize(route.method)}` : method.name,
            responses: { "200": successResponse },
          };

          if (definedSchemas.has(method.request)) {
            operation.requestBody = {
              required: true,
              content: { [mediaType]: { schema: { $ref: refTo(method.request) } } },
            };
          }

          const parameters = this.pathParameters(route.endpoint);
          if (parameters.length) operation.parameters = parameters;

          pathItem[route.method] = operation;
        }
      }
    }

    const componentSchemas: Record<string, OpenApiSchema> = {};
    for (const [name, schema] of Object.entries(schemas)) {
      componentSchemas[name] = buildSchemaObject(schema);
    }

    return {
      openapi: "3.1.0",
      info: { title: "Speedy Web API", version },
      servers: [{ url: this.extractBaseUrl() ?? "https://api.speedy.bg/v1" }],
      tags: services.map((s) => ({ name: s.name })),
      paths,
      components: { schemas: componentSchemas },
    };
  }

  /**
    * Extracts services (and their methods) from section 2 of the API documentation.
    * Services are defined at the 2.x level; their methods at the 2.x.y.z level.
    * @return A list of the services in the documentation
    */
  extractServices(): Service[] {
    const section = this.extractSection("2. Overall Description");
    const services: Service[] = []
    let current: Service | undefined;
    let lastMethod: ServiceMethod | undefined;

    for (const el of section) {
      if (!el.is("h3")) continue;

      const headerText = this.apiDoc(el).text().trim();
      const dotCount = (headerText.match(/\./g) || []).length;

      // A service header (e.g. "2.1. Shipment Service") has at most two dots.
      if (dotCount <= 2) {
        const serviceName = headerText.split(" ").slice(1).join(" ").trim()
        if (!serviceName) continue;

        current = {
          name: capitalize(serviceName),
          section: headerText.split(" ")[0]!,
          methods: [],
          baseUrl: this.extractBaseUrlAfter(el),
        };
        services.push(current);
        lastMethod = undefined;
        continue;
      }

      if (!current) continue;

      // A method request header (e.g. "2.1.1.1. Create Shipment Request (CreateShipmentRequest)").
      if (headerText.includes("Request)")) {
        const method = this.extractServiceMethod(el, headerText, current);
        if (method) {
          current.methods.push(method);
          lastMethod = method;
        }
        continue;
      }

      // The matching response header carries the actual response schema name,
      // which doesn't always follow the "<Request> -> <Response>" convention.
      if (headerText.includes("Response)") && lastMethod) {
        const responseName = headerText.match(/\(([^)]+)\)/)?.[1]?.trim().replaceAll(" ", "");
        if (responseName) lastMethod.response = responseName;
        lastMethod = undefined;
      }
    }

    this.logger.info("Extracted services:", services);
    return services;
  }

  /**
   * Parses a single method from its request `<h3>` header.
   * Walks the siblings up to the next `<h3>` to collect every (Web service URL,
   * Method, Content-type) group, yielding one `ServiceRoute` per HTTP method.
   */
  private extractServiceMethod(h3: cheerio.Cheerio<Element>, headerText: string, service: Service): ServiceMethod | undefined {
    const request = headerText.match(/\(([^)]+)\)/)?.[1]?.trim().replaceAll(" ", "");
    if (!request) return;

    const tokens: Array<{ kind: "url" | "method" | "ct"; value: string }> = [];
    let node = h3.next();
    while (node.length && !node.is("h3")) {
      if (node.is("span.spanWebService")) {
        const collected = this.collectValueAfter(node);
        tokens.push({ kind: "url", value: this.cleanEndpoint(collected.value) });
        node = collected.next;
        continue;
      }
      if (node.is("span.spanMethod")) {
        const collected = this.collectValueAfter(node);
        tokens.push({ kind: "method", value: collected.value.trim() });
        node = collected.next;
        continue;
      }
      if (node.is("span.spanContentType")) {
        const collected = this.collectValueAfter(node);
        tokens.push({ kind: "ct", value: collected.value.trim() });
        node = collected.next;
        continue;
      }
      node = node.next();
    }

    // Group tokens into routes. The HTTP method anchors a route; the endpoint is
    // the most recent Web service URL (or the service base url if none).
    const routes: ServiceRoute[] = [];
    let pendingUrl: string | undefined;
    let currentRoute: ServiceRoute | undefined;
    for (const token of tokens) {
      if (token.kind === "url") {
        pendingUrl = token.value;
      } else if (token.kind === "method") {
        currentRoute = {
          endpoint: pendingUrl ?? service.baseUrl,
          method: token.value.toLowerCase(),
        };
        routes.push(currentRoute);
        pendingUrl = undefined;
      } else if (token.kind === "ct" && currentRoute && !currentRoute.contentType) {
        currentRoute.contentType = token.value;
      }
    }

    if (!routes.length) {
      // No explicit HTTP method documented: assume a POST to the service base url.
      routes.push({ endpoint: service.baseUrl, method: "post" });
    }

    return {
      name: toCamelCase(request.replace(/Request$/, "")),
      request,
      response: request.replace(/Request$/, "Response"),
      routes,
    };
  }

  /**
   * Collects the text of the siblings following a label span (e.g. the URL after
   * "Web service URL:"), stopping at a `<br>`, the next labelled span, an `<h3>`
   * or a `<table>`.
   */
  private collectValueAfter(label: cheerio.Cheerio<Element>): { value: string; next: cheerio.Cheerio<Element> } {
    let node = label.next();
    let value = "";
    while (node.length) {
      if (
        node.is("br") || node.is("h3") || node.is("table") ||
        node.is("span.spanWebService") || node.is("span.spanMethod") || node.is("span.spanContentType")
      ) break;
      value += node.text();
      node = node.next();
    }
    return { value, next: node };
  }

  /**
   * Normalizes a raw endpoint string ("BASE_URL/shipment") into a path ("/shipment").
   * The URL is sometimes followed by descriptive prose in the same text node
   * (e.g. "BASE_URL/print Used to create labels..."), so only the first
   * whitespace-delimited token is kept — endpoints never contain spaces.
   */
  private cleanEndpoint(value: string): string {
    const token = value.trim().split(/\s+/)[0] ?? "";
    let endpoint = token.replace(/^BASE_URL/, "");
    if (!endpoint) return "";
    if (!endpoint.startsWith("/")) endpoint = "/" + endpoint;
    return endpoint;
  }

  /** Finds the Web service URL declared between a service `<h3>` and the next `<h3>`. */
  private extractBaseUrlAfter(h3: cheerio.Cheerio<Element>): string {
    let node = h3.next();
    while (node.length && !node.is("h3")) {
      if (node.is("span.spanWebService")) {
        return this.cleanEndpoint(this.collectValueAfter(node).value);
      }
      node = node.next();
    }
    return "";
  }

  /** Extracts the `BASE_URL=...` value declared at the top of section 2. */
  private extractBaseUrl(): string | undefined {
    const section = this.extractSection("2. Overall Description");
    for (const el of section) {
      const match = this.apiDoc(el).text().match(/BASE_URL\s*=\s*(\S+)/);
      if (match) return match[1];
    }
    return undefined;
  }

  /** Builds OpenAPI path parameters from `{placeholder}`s in an endpoint. */
  private pathParameters(endpoint: string): OpenAPIV3_1.ParameterObject[] {
    const parameters: OpenAPIV3_1.ParameterObject[] = [];
    for (const match of endpoint.matchAll(/\{([^}]+)\}/g)) {
      parameters.push({ name: match[1]!, in: "path", required: true, schema: { type: "string" } });
    }
    return parameters;
  }

  /**
   * Extracts request/response schemas from Section 2 of the API documentation.
   *
   * @return An object mapping of the schema name to the schema.
   */
  extractRequestResponseSchemas(): SchemaMap {
    const section = this.extractSection("2. Overall Description");
    const schemaMap: SchemaMap = {};

    // Find all h3 elements that contain "Request" or "Response" in their text
    // If we can't find a table between the h3 and the next h3, the schema is the same as another schema and it's
    // specified in the following format:
    // The response is the same as CreateShipmentResponse.
    // In this case, we set the schema to extend the referenced schema.
    // Otherwise, we extract the schema from the table following the h3.
    section.forEach((el) => {
      if (!el.is("h3")) return;
      const headerText = this.apiDoc(el).text().trim();
      if (!headerText.includes("Request)") && !headerText.includes("Response)")) return;

      // The schema name is the word in the parentheses of the header. This is the
      // authoritative name — the table's own name row is sometimes wrong in the docs.
      const schemaName = headerText.match(/\(([^)]+)\)/)?.[1]?.trim().replaceAll(" ", "");
      if (!schemaName) return;

      let tableNode: cheerio.Cheerio<Element> | undefined;
      let sameAsNode: cheerio.Cheerio<Element> | undefined;

      let cur = el.next();
      while (cur.length && !cur.is("h3")) {
        if (cur.is("table")) {
          tableNode = cur;
          break;
        }
        // Check for "The response is the same as <a>XxxXXxxResponse.</a>"
        if (cur.is("a")) {
          const text = cur.text().trim().toLowerCase().replaceAll(".", "");
          if (text.endsWith("response") || text.endsWith("request")) {
            sameAsNode = cur;
          }
        }
        cur = cur.next();
      }

      if (tableNode) {
        const parsed = this.parseSchemaTable(tableNode);
        if (parsed) schemaMap[schemaName] = parsed.schema;
      } else if (sameAsNode && !schemaMap[schemaName]?.fields.length) {
        // Don't clobber a schema already defined by a real table (some response
        // names, e.g. "ValidationResponse", are shared across several endpoints).
        // The reference may be prefixed with a section number ("2.8.2. ValidationResponse"),
        // so keep only the trailing schema name.
        const sameAs = (sameAsNode.text().trim().split(/\s+/).pop() ?? "").replaceAll(".", "");
        if (sameAs) {
          schemaMap[schemaName] = { fields: [], extends: sameAs };
          this.logger.info(`From same-as: ${headerText} extends ${sameAs}`);
        }
      }
    });

    return schemaMap;
  }

  /**
   * Every data schema in Section 3 of the API is defined in its own table.
   * The first table row contains the schema name.
   * The subsequent rows contain the fields.
   *
   * Extracts all schemas from the "3. Data Structures" section of the API documentation.
   * @return An object mapping of the schema name to the schema.
   */
  extractDataStructuresSchemas() {
    const section = this.extractSection("3. Data Structures");
    const schemaMap: SchemaMap = {};

    section.forEach((el) => {
      const schema = this.extractSchemaFromTable(el);
      if (!schema) return;

      Object.assign(schemaMap, schema);
    });

    return schemaMap;
  }

  extractSchemaFromTable(table: cheerio.Cheerio<Element>): SchemaMap | undefined {
    const parsed = this.parseSchemaTable(table);
    if (!parsed) return;
    return { [parsed.name]: parsed.schema };
  }

  /**
   * Parses a data-structure table into its schema name (from the first row) and
   * its fields. Request/response tables in the docs sometimes carry a wrong name
   * row (copy/paste errors), so callers that know the real name should use
   * {@link parseSchemaTable} and ignore `name`.
   */
  parseSchemaTable(table: cheerio.Cheerio<Element>): { name: string; schema: Schema } | undefined {
    if (!table.is("table")) return;

    const rows = table.find("tr").toArray();
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
    return { name: schemaName, schema: { fields, extends: schemaExtends } };
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
    const text = await this.docsProvider.getDocs();

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
}

if (import.meta.main) {
  // Usage:
  //   bun ./gen/generate.ts                              fetch live docs -> ./openapi.yaml
  //   bun ./gen/generate.ts <input.html> [output.yaml]   build from a local HTML file
  const [inputArg, outArg] = process.argv.slice(2);
  const provider = inputArg ? new FileDocsProvider(inputArg) : new FetchDocsProvider();
  const generator = await new APIGenerator(provider).init();
  await generator.generate(outArg ?? "./openapi.yaml");
}
