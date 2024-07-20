import { RenderToStreamOptions } from "xenon-ssg/src/render";
import { PluginInjectableTag, PluginReturn } from "./plugins/plugins";
import React, { type ReactNode } from "react";

export type XenonExpressRenderMeta = {
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
};

export const makeXenonRenderFromXenonExpressSite = (site: XenonExpressSite) => {
  const injectableRaw = site.plugins.flatMap(
    (plugin) => plugin.injectable ?? []
  );
  const injectable = injectableRaw?.map((tag, index) => {
    switch (tag.type) {
      case "stylesheet":
        return <link key={index} rel="stylesheet" href={tag.href} />;
      default:
        throw new Error(`Unknown injectable tag type: ${tag.type}`);
    }
  });

  return (pathname: string) =>
    site.render({ pathname, injectableRaw, injectable });
};
