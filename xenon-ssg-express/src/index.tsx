import type { RenderToStreamOptions } from "xenon-ssg/src/render";
import type { PluginInjectableTag, Plugin } from "./plugins/plugins";
import type { ReactNode } from "react";
import { DEFAULT_DEV_PORT } from "./dev";

export type XenonExpressSiteMeta = {
  origin: string;
  basepath: string;
};

export type XenonExpressRenderMeta = XenonExpressSiteMeta & {
  pathname: string;
  injectableRaw: PluginInjectableTag[];
  injectable: ReactNode[];
};

export type XenonExpressRenderFunction = (
  meta: XenonExpressRenderMeta,
) => ReactNode;

export type XenonExpressSite = {
  render: XenonExpressRenderFunction;
  renderToStreamOptions: RenderToStreamOptions;
  plugins: Plugin[];
  devPort?: number;
};

export const getSiteMeta = (site: XenonExpressSite) => ({
  origin:
    process.env["XENON_ORIGIN"] ??
    `http://localhost:${site.devPort ?? DEFAULT_DEV_PORT}`,
  basepath: process.env["XENON_BASE_PATH"] ?? "",
});

export const makeXenonRenderFromXenonExpressSite = (site: XenonExpressSite) => {
  const siteMeta = getSiteMeta(site);

  const plugins = site.plugins
    .flatMap((plugin) => plugin(siteMeta))
    .filter((x) => x !== undefined);

  const injectableRaw = plugins.flatMap((plugin) => plugin.injectable ?? []);

  const injectable = injectableRaw?.map((tag, index) => {
    switch (tag.tagType) {
      case "stylesheet":
        return <link key={index} rel="stylesheet" href={tag.href} />;

      case "link":
        return (
          <link
            key={index}
            rel={tag.rel}
            type={tag.type}
            title={tag.title}
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

  return (pathname: string) =>
    site.render({ ...siteMeta, pathname, injectableRaw, injectable });
};
