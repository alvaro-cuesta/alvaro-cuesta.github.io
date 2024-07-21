import { type RenderToStreamOptions, renderToStream } from "./render";
import { canonicalizeHref } from "./url";
import { Root } from "./Root";
// TODO: Make this a generic middleware and not Express-specific (if such a thing exists)
import type { Request, Response, NextFunction } from "express";
import type { XenonRenderFunction } from ".";

const doNothing = () => {};

export const makeXenonMiddleware =
  (render: XenonRenderFunction, options?: RenderToStreamOptions) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { pathname } = canonicalizeHref(req.path);

    const renderedStream = renderToStream(
      <Root
        // We don't have to crawl links in middleware mode since we're not pre-rendering anything
        addLink={doNothing}
      >
        {render(pathname)}
      </Root>,
      options
    );

    renderedStream.on("error", (error) => {
      next(error);
    });

    renderedStream.pipe(res);
  };
