import type { RenderToStreamOptions } from "xenon-ssg/src/render";
import type { PluginInjectableTag, PluginReturn } from "./plugins/plugins";
import type { ReactNode } from "react";
import { DEFAULT_DEV_PORT } from "./dev";

export type XenonExpressRenderMeta = {
  origin: string;
  basepath: string;
  pathname: string;
  injectableRaw?: PluginInjectableTag[];
  injectable?: ReactNode[];
};

export type XenonExpressRenderFunction = (
  meta: XenonExpressRenderMeta
) => ReactNode;

export type XenonExpressSite = {
  render: XenonExpressRenderFunction;
  renderToStreamOptions: RenderToStreamOptions;
  plugins: PluginReturn[];
  devPort?: number;
};

export const makeXenonRenderFromXenonExpressSite = (site: XenonExpressSite) => {
  const injectableRaw = site.plugins.flatMap(
    (plugin) => plugin.injectable ?? []
  );
  const injectable = injectableRaw?.map((tag, index) => {
    switch (tag.type) {
      case "stylesheet":
        return <link key={index} rel="stylesheet" href={tag.href} />;

      case "link":
        return (
          <link
            key={index}
            rel={tag.rel}
            sizes={tag.sizes}
            media={tag.media}
            href={tag.href}
          />
        );

      case "meta":
        return <meta key={index} name={tag.name} content={tag.content} />;

      default:
        // @ts-expect-error This should never happen
        throw new Error(`Unknown injectable tag type: ${tag.type}`);
    }
  });

  const origin =
    process.env["XENON_ORIGIN"] ??
    `http://localhost:${site.devPort ?? DEFAULT_DEV_PORT}`;
  const basepath = process.env["XENON_BASE_PATH"] ?? "";

  return (pathname: string) =>
    site.render({ origin, basepath, pathname, injectableRaw, injectable });
};
