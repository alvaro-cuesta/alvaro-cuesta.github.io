import fs from "node:fs/promises";
import path from "node:path";
import { generateStaticSite } from "xenon-ssg/src/generate/generate";
import { renderSite } from "./src/site";
import {
  FONTAWESOME_FILE,
  FONTAWESOME_FILE_PATH,
  FONTAWESOME_WEBFONTS_PATH,
  OUTPUT_FOLDER,
  PICO_FILE,
  PICO_FILE_PATH,
  RENDER_TO_STREAM_OPTIONS,
  STATIC_FOLDER,
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

  await fs.cp(STATIC_FOLDER, OUTPUT_FOLDER, { recursive: true });
  await fs.cp(
    PICO_FILE_PATH,
    path.join(OUTPUT_FOLDER, "css", "pico", PICO_FILE)
  );
  await fs.cp(
    FONTAWESOME_FILE_PATH,
    path.join(OUTPUT_FOLDER, "css", "fontawesome", "css", FONTAWESOME_FILE)
  );
  await fs.cp(
    FONTAWESOME_WEBFONTS_PATH,
    path.join(OUTPUT_FOLDER, "css", "fontawesome", "webfonts"),
    { recursive: true }
  );

  console.log("All done!");
};

main();
