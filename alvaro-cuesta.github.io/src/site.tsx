import React from "react";
import { Homepage } from "./pages/Homepage";
import { NotFound } from "./pages/NotFound";
import {
  XenonExpressRenderMeta,
  XenonExpressSite,
} from "xenon-ssg-express/src";
import { RENDER_TO_STREAM_OPTIONS } from "../config";
import { staticFilePlugin } from "xenon-ssg-express/src/plugins/static-file";
import { staticFolderPlugin } from "xenon-ssg-express/src/plugins/static-folder";
import { singleLightningCssPlugin } from "xenon-ssg-express/src/plugins/single-lightningcss";
import path from "node:path";
import { faviconPlugin } from "xenon-ssg-express/src/plugins/favicon";
import { version } from "../package.json";

const render = (meta: XenonExpressRenderMeta) => {
  if (meta.pathname === "/") {
    return <Homepage injectable={meta.injectable} />;
  }

  if (meta.pathname === "/404.html") {
    return <NotFound injectable={meta.injectable} />;
  }

  throw new Error(`Path not found: ${meta.pathname}`);
};

const PICO_FILE = "pico.blue.min.css";
const PICO_FILE_PATH = require.resolve(`@picocss/pico/css/${PICO_FILE}`);
export const picoCss = staticFilePlugin({
  inputFilepath: PICO_FILE_PATH,
  outputFilename: PICO_FILE,
  mountPointFragments: ["css", "pico"],
  injectAs: "stylesheet",
});

const FONTAWESOME_FILE = "all.min.css";
const FONTAWESOME_FILE_PATH = require.resolve(
  `fontawesome-free/css/${FONTAWESOME_FILE}`
);
export const fontAwesomeCss = staticFilePlugin({
  inputFilepath: FONTAWESOME_FILE_PATH,
  outputFilename: FONTAWESOME_FILE,
  mountPointFragments: ["css", "fontawesome", "css"],
  injectAs: "stylesheet",
});

const FONTAWESOME_WEBFONTS_PATH = path.join(
  require.resolve("fontawesome-free"),
  "..", // @hack for some reason main is `attribution.js`
  "webfonts"
);
export const fontawesomeWebfontsFolder = staticFolderPlugin({
  inputFolder: FONTAWESOME_WEBFONTS_PATH,
  mountPointFragments: ["css", "fontawesome", "webfonts"],
});

const STATIC_FOLDER = path.join(__dirname, "..", "static");
export const staticFolder = staticFolderPlugin({
  inputFolder: STATIC_FOLDER,
  mountPointFragments: ["/"],
});

const INDEX_CSS_PATH = path.join(__dirname, "index.css");
export const indexCss = singleLightningCssPlugin({
  inputFilepath: INDEX_CSS_PATH,
  outputFilename: "index.min.css",
  mountPointFragments: ["css"],
});

export const makeSite = async (): Promise<XenonExpressSite> => {
  const favicon = await faviconPlugin({
    inputFilepath: path.join(__dirname, "favicon.svg"),
    faviconOptions: {
      appName: "Álvaro Cuesta",
      appShortName: "Álvaro Cuesta",
      appDescription: "Álvaro Cuesta's personal website",
      developerName: "Álvaro Cuesta",
      developerURL: "https://github.com/alvaro-cuesta",
      background: "#13171f", // --pico-background-color
      theme_color: "#8999f9", // --pico-color
      display: "browser",
      version,
    },
    mountPointFragments: ["/"],
  });

  return {
    render,
    renderToStreamOptions: RENDER_TO_STREAM_OPTIONS,
    plugins: [
      favicon,
      staticFolder,
      picoCss,
      fontAwesomeCss,
      fontawesomeWebfontsFolder,
      indexCss,
    ],
  };
};
