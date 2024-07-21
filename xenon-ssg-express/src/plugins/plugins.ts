import type { Express } from "express";

export type PluginInjectableStylesheet = {
  type: "stylesheet";
  href: string;
};

export type PluginInjectableLink = {
  type: "link";
  rel: string;
  sizes?: string | undefined;
  media?: string | undefined;
  href: string;
};

export type PluginInjectableMeta = {
  type: "meta";
  name: string;
  content: string;
};

export type PluginInjectableTag =
  | PluginInjectableStylesheet
  | PluginInjectableLink
  | PluginInjectableMeta;

export type PluginReturn = {
  /**
   * Attaches the plugin to Express during `dev` mode.
   */
  attachToExpress: (app: Express) => void;

  /**
   * Builds the plugin during `build` mode.
   */
  build: (baseOutputFolder: string) => Promise<void>;

  /**
   * Injectable tags that can be used by the plugin.
   *
   * For example, a CSS file can be injected into the HTML head.
   */
  injectable?: PluginInjectableTag[] | undefined;
};
