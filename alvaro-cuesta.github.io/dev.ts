import { site } from "./src/site";
import { DEV_PORT } from "./config";
import { startXenonExpressDevApp } from "xenon-ssg-express/src/dev";

startXenonExpressDevApp(site, DEV_PORT);
