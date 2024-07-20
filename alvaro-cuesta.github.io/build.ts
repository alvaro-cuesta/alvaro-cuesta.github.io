import fs from "node:fs/promises";
import path from "node:path";
import { generateStaticSite } from "xenon-ssg/src/generate/generate";
import { renderSite } from "./src/site";
import { PICO_FILE } from "./config";

const STATIC_FOLDER = path.join(__dirname, "static");
const OUTPUT_FOLDER = path.join(__dirname, "dist");

const main = async () => {
  await fs.rm(OUTPUT_FOLDER, {
    recursive: true,
    force: true,
  });

  await generateStaticSite(renderSite, {
    entryPaths: new Set(["", "404.html"]),
    outputDir: OUTPUT_FOLDER,
    renderToStreamOptions: {
      timeoutMsecs: 1000,
    },
  });

  console.log("Copying static files...");

  await fs.cp(STATIC_FOLDER, OUTPUT_FOLDER, { recursive: true });

  await fs.cp(
    require.resolve(`@picocss/pico/css/${PICO_FILE}`),
    path.join(OUTPUT_FOLDER, "css", "pico", PICO_FILE),
    { recursive: true }
  );

  console.log("All done!");
};

main();
