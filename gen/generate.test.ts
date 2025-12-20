import { test } from "bun:test";
import { APIGenerator, type DocsProvider } from "./generate";
import { join } from "path";

class FileDocsProvider implements DocsProvider {
  constructor(private filePath: string = "../fixtures/full-docs.html") { }

  getDocumentation() {
    const htmlPath = join(import.meta.dir, this.filePath);
    return Bun.file(htmlPath).text();
  }
}


test("Extract Requests and Responses without table", async () => {
  const docsProvider = new FileDocsProvider("../fixutres/request-without-table.html");
  const generator = await new APIGenerator(docsProvider).init()

  const schema = generator.extractRequestResponseSchemas()
  console.log(schema);
});
