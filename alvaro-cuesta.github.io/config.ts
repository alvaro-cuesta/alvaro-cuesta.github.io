import { RenderToStreamOptions } from "xenon-ssg/src/render";
import path from "node:path";
import { defineCssFile, defineDynamicCss, defineStaticFolder } from "./defines";

export const OUTPUT_FOLDER = path.join(__dirname, "dist");

export const DEV_PORT = 3000;

export const RENDER_TO_STREAM_OPTIONS: RenderToStreamOptions = {
  timeoutMsecs: 1000,
};

const PICO_FILE = "pico.blue.min.css";
const PICO_FILE_PATH = require.resolve(`@picocss/pico/css/${PICO_FILE}`);
export const picoCss = defineCssFile({
  inputFilepath: PICO_FILE_PATH,
  outputFilename: PICO_FILE,
  mountPointFragments: ["css", "pico"],
});

const FONTAWESOME_FILE = "all.min.css";
const FONTAWESOME_FILE_PATH = require.resolve(
  `fontawesome-free/css/${FONTAWESOME_FILE}`
);
export const fontAwesomeCss = defineCssFile({
  inputFilepath: FONTAWESOME_FILE_PATH,
  outputFilename: FONTAWESOME_FILE,
  mountPointFragments: ["css", "fontawesome", "css"],
});

const FONTAWESOME_WEBFONTS_PATH = path.join(
  require.resolve("fontawesome-free"),
  "..", // @hack for some reason main is `attribution.js`
  "webfonts"
);
export const fontawesomeWebfontsFolder = defineStaticFolder({
  inputFolder: FONTAWESOME_WEBFONTS_PATH,
  mountPointFragments: ["css", "fontawesome", "webfonts"],
});

const STATIC_FOLDER = path.join(__dirname, "static");
export const staticFolder = defineStaticFolder({
  inputFolder: STATIC_FOLDER,
  mountPointFragments: ["/"],
});

const INDEX_CSS_PATH = path.join(__dirname, "src", "index.css");
export const indexCss = defineDynamicCss({
  inputFilepath: INDEX_CSS_PATH,
  outputFilename: "index.min.css",
  mountPointFragments: ["css"],
});
