import { renderSite } from "./src/site";
import express from "express";
import path from "node:path";
import fs from "node:fs/promises";
import { makeXenonMiddleware } from "../xenon-ssg/src/middleware";
import morgan from "morgan";
import {
  DEV_PORT,
  FONTAWESOME_FILE_PATH,
  FONTAWESOME_WEBFONTS_PATH,
  PICO_FILE_PATH,
  RENDER_TO_STREAM_OPTIONS,
} from "./config";
import { transform } from "lightningcss";

const app = express();

app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "static")));
app.use("/css/pico/*", express.static(PICO_FILE_PATH));
app.use("/css/fontawesome/css/*", express.static(FONTAWESOME_FILE_PATH));
app.use("/css/fontawesome/webfonts", express.static(FONTAWESOME_WEBFONTS_PATH));
app.get("/css/index.min.css", async (req, res) => {
  const inputCode = await fs.readFile(path.join(__dirname, "src", "index.css"));

  let { code } = transform({
    filename: "index.css",
    code: inputCode,
    minify: true,
    sourceMap: false,
  });

  res.status(200).contentType("css").end(code);
});

app.use(makeXenonMiddleware(renderSite, RENDER_TO_STREAM_OPTIONS));

app.listen(DEV_PORT, "127.0.0.1", () => {
  console.log(`Listening on http://localhost:${DEV_PORT}`);
});
