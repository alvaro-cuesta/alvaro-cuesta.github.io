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
import { transform } from "lightningcss";

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
  const inputCode = await fs.readFile(path.join(__dirname, "src", "index.css"));

  let { code } = transform({
    filename: "index.css",
    code: inputCode,
    minify: true,
    sourceMap: false,
  });
  await fs.mkdir(path.join(OUTPUT_FOLDER, "css"), { recursive: true });
  await fs.writeFile(path.join(OUTPUT_FOLDER, "css", "index.min.css"), code);

  await fs.cp(
    FONTAWESOME_WEBFONTS_PATH,
    path.join(OUTPUT_FOLDER, "css", "fontawesome", "webfonts"),
    { recursive: true }
  );
  await fs.cp(
    PICO_FILE_PATH,
    path.join(OUTPUT_FOLDER, "css", "pico", PICO_FILE)
  );
  await fs.cp(
    FONTAWESOME_FILE_PATH,
    path.join(OUTPUT_FOLDER, "css", "fontawesome", "css", FONTAWESOME_FILE)
  );
  await fs.cp(STATIC_FOLDER, OUTPUT_FOLDER, { recursive: true });

  console.log("All done!");
};

main();
