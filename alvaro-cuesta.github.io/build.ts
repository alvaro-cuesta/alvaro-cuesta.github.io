import fs from "node:fs/promises";
import { generateStaticSite } from "xenon-ssg/src/generate/generate";
import { renderSite } from "./src/site";
import {
  OUTPUT_FOLDER,
  RENDER_TO_STREAM_OPTIONS,
  fontAwesomeCss,
  fontawesomeWebfontsFolder,
  indexCss,
  picoCss,
  staticFolder,
} from "./config";

const main = async () => {
  await fs.rm(OUTPUT_FOLDER, {
    recursive: true,
    force: true,
  });

  await generateStaticSite(renderSite, {
    entryPaths: new Set(["", "404.html"]),
    outputDir: OUTPUT_FOLDER,
    renderToStreamOptions: RENDER_TO_STREAM_OPTIONS,
  });

  console.log("Copying static files...");

  // This must be in reverse order of middleware in dev.ts to ensure the same priority in case a file is overriden by
  // mistake. Unlikely to happen but better have the same behavior to avoid confusing differences between build and dev.
  await indexCss.copy(OUTPUT_FOLDER);
  await fontawesomeWebfontsFolder.copy(OUTPUT_FOLDER);
  await fontAwesomeCss.copy(OUTPUT_FOLDER);
  await picoCss.copy(OUTPUT_FOLDER);
  await staticFolder.copy(OUTPUT_FOLDER);

  console.log("All done!");
};

main();
