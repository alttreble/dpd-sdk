import { test, expect } from "bun:test";
import { APIGenerator, type DocsProvider, type ServiceMethod } from "./generate";
import { join } from "path";
import { ConsoleLogger } from "../logger";
import { DocsNormalizer } from "./docs-normalizer";

const logger = new ConsoleLogger();

class FileDocsProvider implements DocsProvider {
  constructor(
    private filePath = "../fixtures/full-docs.html",
    private normalizer = new DocsNormalizer()
  ) { }

  async getDocs() {
    const htmlPath = join(import.meta.dir, this.filePath);
    logger.info("Loading docs from:", htmlPath);
    const rawDocument = await Bun.file(htmlPath).text();
    return this.normalizer.normalize(rawDocument)
  }
}


test("Extract Requests and Responses without table", async () => {
  const docsProvider = new FileDocsProvider("../fixtures/request-without-table.html");
  const generator = await new APIGenerator(docsProvider).init()

  const schema = generator.extractRequestResponseSchemas()
  expect(schema).toEqual({
    "FinalizePendingShipmentResponse": {
      extends: "CreateShipmentResponse",
      fields: []
    }
  });
});

test("Extract service and methods that inherit the endpoint.", async () => {
  // The fixture contains only the Shipment Service with one method that inherits the endpoint:
  //
  // 2.1. Shipment Service
  // Web service URL: BASE_URL/shipment
  // 2.1.1.1. Create Shipment Request (CreateShipmentRequest)
  // Method: POST
  // Content-type: application/json; charset=utf-8
  const docsProvider = new FileDocsProvider("../fixtures/inherited-endpoint.html");
  const generator = await new APIGenerator(docsProvider).init()

  const [shipmentService] = generator.extractServices();
  expect(shipmentService).toBeDefined()
  expect(shipmentService!.name).toBe("Shipment Service");
  expect(shipmentService!.section).toBe("2.1.");
  expect(shipmentService!.baseUrl).toBe("/shipment");

  // Create Shipment declares no Web service URL of its own, so it inherits the
  // service's base url ("/shipment").
  const expectedMethod: ServiceMethod = {
    name: "createShipment",
    request: "CreateShipmentRequest",
    response: "CreateShipmentResponse",
    routes: [{
      endpoint: "/shipment",
      method: "post",
      contentType: "application/json; charset=utf-8",
    }],
  };

  expect(shipmentService!.methods[0]).toEqual(expectedMethod);
});

test("Normalize docs html", async () => {
  const docsProvider = new FileDocsProvider("../fixtures/full-docs.html");
  const documentation = await docsProvider.getDocs();

  Bun.write(join(import.meta.dir, "../fixtures/full-docs-normalized.html"), documentation);
});

test("Generate OpenAPI schema", async () => {
  const docsProvider = new FileDocsProvider("../fixtures/full-docs.html");
  const generator = await new APIGenerator(docsProvider).init()

  const doc = await generator.generate(join(import.meta.dir, "../fixtures/openapi.yaml"));

  expect(doc.openapi).toBe("3.1.0");
  expect(doc.components?.schemas?.CreateShipmentRequest).toBeDefined();

  // The Create Shipment method lives at POST /shipment.
  const createShipment = doc.paths?.["/shipment"]?.post;
  expect(createShipment).toBeDefined();
  expect(createShipment?.tags).toContain("Shipment Service");

  // Cancel Shipment documents two alternative routes (POST /shipment/cancel OR DELETE /shipment).
  expect(doc.paths?.["/shipment/cancel"]?.post).toBeDefined();
});
