import { renderSite } from "./src/site";
import express from "express";
import path from "node:path";
import { makeXenonMiddleware } from "../xenon-ssg/src/middleware";
import morgan from "morgan";
import { PICO_FILE } from "./config";

const picoCssFile = require.resolve(`@picocss/pico/css/${PICO_FILE}`);

const PORT = 3000;

const app = express();

app.use(morgan("dev"));

app.use(express.static(path.join(process.cwd(), "static")));

app.use("/css/pico/*", express.static(path.join(picoCssFile)));

app.use(
  makeXenonMiddleware(renderSite, {
    timeoutMsecs: 1000,
  })
);

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
