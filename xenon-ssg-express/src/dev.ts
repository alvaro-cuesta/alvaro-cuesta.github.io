import express, { Express } from "express";
import { makeXenonMiddleware } from "xenon-ssg/src/middleware";
import morgan from "morgan";
import { XenonExpressSite, makeXenonRenderFromXenonExpressSite } from ".";

const DEFAULT_PORT = 1337;

/**
 * Create an Express app that serves a Xenon site in development mode.
 */
export const makeXenonDevExpressApp = (site: XenonExpressSite): Express => {
  const app = express();

  app.use(morgan("dev"));

  for (const plugins of site.plugins) {
    plugins.attachToExpress(app);
  }

  app.use(
    makeXenonMiddleware(
      makeXenonRenderFromXenonExpressSite(site),
      site.renderToStreamOptions
    )
  );

  return app;
};

/**
 * Convenience function if you just want to quickly start a dev server.
 */
export const startXenonExpressDevApp = (
  site: XenonExpressSite,
  port: number = DEFAULT_PORT
) => {
  const app = makeXenonDevExpressApp(site);

  app.listen(port, "127.0.0.1", () => {
    console.log(`Listening on http://localhost:${port}`);
  });

  return app;
};
