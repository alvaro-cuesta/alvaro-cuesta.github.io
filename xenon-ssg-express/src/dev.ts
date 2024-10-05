import express, { type Express } from "express";
import { makeXenonMiddleware } from "xenon-ssg/src/middleware";
import morgan from "morgan";
import {
  type XenonExpressSite,
  getSiteMeta,
  makeXenonRenderFromXenonExpressSite,
} from ".";

export const DEFAULT_DEV_PORT = 1337;

/**
 * Create an Express app that serves a Xenon site in development mode.
 */
export const makeXenonDevExpressApp = (site: XenonExpressSite): Express => {
  const app = express();

  app.use(morgan("dev"));

  const siteMeta = getSiteMeta(site);
  const plugins = site.plugins
    .map((plugin) => plugin(siteMeta))
    .filter((x) => x !== undefined);

  for (const plugin of plugins) {
    plugin.attachToExpress(app);
  }

  app.use(
    makeXenonMiddleware(
      makeXenonRenderFromXenonExpressSite(site),
      site.renderToStreamOptions,
    ),
  );

  return app;
};

/**
 * Convenience function if you just want to quickly start a dev server.
 */
export const startXenonExpressDevApp = (site: XenonExpressSite) => {
  const app = makeXenonDevExpressApp(site);
  const port = site.devPort ?? DEFAULT_DEV_PORT;

  app.listen(port, "127.0.0.1", () => {
    console.log(`Listening on http://localhost:${port}`);
  });

  return app;
};
