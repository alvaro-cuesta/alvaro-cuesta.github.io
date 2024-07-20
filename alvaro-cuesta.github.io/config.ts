import { RenderToStreamOptions } from "xenon-ssg/src/render";
import path from "node:path";

export const PICO_FILE = "pico.blue.min.css";
export const PICO_FILE_PATH = require.resolve(`@picocss/pico/css/${PICO_FILE}`);

export const FONTAWESOME_FILE = "all.min.css";
export const FONTAWESOME_FILE_PATH = require.resolve(
  `fontawesome-free/css/${FONTAWESOME_FILE}`
);
export const FONTAWESOME_WEBFONTS_PATH = path.join(
  require.resolve("fontawesome-free"),
  "..", // @hack for some reason main is `attribution.js`
  "webfonts"
);

export const STATIC_FOLDER = path.join(__dirname, "static");
export const OUTPUT_FOLDER = path.join(__dirname, "dist");

export const DEV_PORT = 3000;

export const RENDER_TO_STREAM_OPTIONS: RenderToStreamOptions = {
  timeoutMsecs: 1000,
};
