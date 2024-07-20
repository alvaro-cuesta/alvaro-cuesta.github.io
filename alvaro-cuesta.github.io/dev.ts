import { renderSite } from "./src/site";
import express from "express";
import path from "node:path";
import fs from "node:fs/promises";
import { makeXenonMiddleware } from "../xenon-ssg/src/middleware";
import morgan from "morgan";
import {
  DEV_PORT,
  RENDER_TO_STREAM_OPTIONS,
  fontAwesomeCss,
  fontawesomeWebfontsFolder,
  indexCss,
  picoCss,
  staticFolder,
} from "./config";
import { transform } from "lightningcss";

const app = express();

app.use(morgan("dev"));

staticFolder.attachToExpress(app);
picoCss.attachToExpress(app);
fontAwesomeCss.attachToExpress(app);
fontawesomeWebfontsFolder.attachToExpress(app);
indexCss.attachToExpress(app);

app.use(makeXenonMiddleware(renderSite, RENDER_TO_STREAM_OPTIONS));

app.listen(DEV_PORT, "127.0.0.1", () => {
  console.log(`Listening on http://localhost:${DEV_PORT}`);
});
