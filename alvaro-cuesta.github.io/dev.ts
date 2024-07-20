import { renderSite } from "./src/site";
import express from "express";
import path from "node:path";
import { makeXenonMiddleware } from "../xenon-ssg/src/middleware";
import morgan from "morgan";
import {
  DEV_PORT,
  FONTAWESOME_FILE_PATH,
  FONTAWESOME_WEBFONTS_PATH,
  PICO_FILE_PATH,
  RENDER_TO_STREAM_OPTIONS,
} from "./config";

const app = express();

app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "static")));
app.use("/css/pico/*", express.static(PICO_FILE_PATH));
app.use("/css/fontawesome/css/*", express.static(FONTAWESOME_FILE_PATH));
app.use("/css/fontawesome/webfonts", express.static(FONTAWESOME_WEBFONTS_PATH));

app.use(makeXenonMiddleware(renderSite, RENDER_TO_STREAM_OPTIONS));

app.listen(DEV_PORT, "127.0.0.1", () => {
  console.log(`Listening on http://localhost:${DEV_PORT}`);
});
