import { site } from "./src/site";
import { OUTPUT_FOLDER } from "./config";
import { buildXenonExpressSite } from "xenon-ssg-express/src/build";

buildXenonExpressSite(site, {
  outputDir: OUTPUT_FOLDER,
  entryPaths: new Set(["", "404.html"]),
});
