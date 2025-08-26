import type { RenderToStreamOptions } from "xenon-ssg/src/render";
import type { PluginInjectableTag, Plugin } from "./plugins/plugins";
import type { ReactNode } from "react";
import { DEFAULT_DEV_PORT } from "./dev";
import type { XenonRenderFunction } from "xenon-ssg/src";

export type XenonExpressSiteMeta = {
  origin: string;
  basepath: string;
  baseUrl: string;
};

export type XenonExpressRenderMeta = XenonExpressSiteMeta & {
  pathname: string;
  injectableRaw: PluginInjectableTag[];
  injectable: ReactNode[];
  injectableCritical: ReactNode[];
};

export type XenonExpressRenderFunction = (
  meta: XenonExpressRenderMeta,
) => ReturnType<XenonRenderFunction>;

export type XenonExpressSite = {
  render: XenonExpressRenderFunction;
  renderToStreamOptions: RenderToStreamOptions;
  plugins: Plugin<any>[];
  devPort?: number;
};

export const getSiteMeta = (site: XenonExpressSite): XenonExpressSiteMeta => {
  const origin =
    process.env["XENON_ORIGIN"] ??
    `http://localhost:${site.devPort ?? DEFAULT_DEV_PORT}`;

  const basepath = process.env["XENON_BASE_PATH"] ?? "";

  return {
    origin,
    basepath,
    baseUrl: `${origin}${basepath}`,
  };
};
