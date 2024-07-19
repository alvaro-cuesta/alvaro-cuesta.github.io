import fs from "node:fs/promises";
import path from "node:path";
import { generateStaticSite } from "xenon-ssg/src/generate/generate";
import { renderSite } from "./src/site";

const STATIC_FOLDER = path.join(__dirname, "static");
const OUTPUT_FOLDER = path.join(__dirname, "dist");

const main = async () => {
  await fs.rm(path.join(OUTPUT_FOLDER, "*"), {
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

  console.log("All done!");
};

main();
