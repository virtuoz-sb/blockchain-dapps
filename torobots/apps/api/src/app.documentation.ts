import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { INestApplication } from "@nestjs/common";
import * as fs from "fs";
import { version } from "../package.json";

/**
 * Auto-generates api documentation using @nestjs/swagger.
 * @param app
 */
const setupDocumentation = (app: INestApplication) => {
  const options = new DocumentBuilder()
    .setTitle("Torobots API")
    .setDescription("Web api offering data to the Torobots front web application.")
    .setVersion(version || "v0.0")
    .addBearerAuth()
    // .setBasePath("api") deprecated
    .build();
  const document = SwaggerModule.createDocument(app, options);
  // writes the generated specs file
  // fs.writeFileSync("./src/main-swagger-spec.json", JSON.stringify(document));
  SwaggerModule.setup("api/doc", app, document);
};
export default setupDocumentation;
