import { renderSite } from "./src/site";
import express from "express";
import path from "node:path";
import { makeXenonMiddleware } from "../xenon-ssg/src/middleware";
import morgan from "morgan";

const PORT = 3000;

const app = express();

app.use(morgan("dev"));

app.use(express.static(path.join(process.cwd(), "static")));

app.use(
  makeXenonMiddleware(renderSite, {
    timeoutMsecs: 1000,
  })
);

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
