import { RenderToStreamOptions } from "xenon-ssg/src/render";
import path from "node:path";

export const OUTPUT_FOLDER = path.join(__dirname, "dist");

export const DEV_PORT = 3000;

export const RENDER_TO_STREAM_OPTIONS: RenderToStreamOptions = {
  timeoutMsecs: 1000,
};
