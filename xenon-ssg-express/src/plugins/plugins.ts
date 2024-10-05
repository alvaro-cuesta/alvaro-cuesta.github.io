import type { Express } from "express";
import type { XenonExpressSiteMeta } from "..";

export type PluginInjectableStylesheet = {
  tagType: "stylesheet";
  href: string;
};

export type PluginInjectableLink = {
  tagType: "link";
  rel: string;
  type?: string | undefined;
  title?: string | undefined;
  sizes?: string | undefined;
  media?: string | undefined;
  href: string;
};

export type PluginInjectableMeta = {
  tagType: "meta";
  name: string;
  content: string;
};

export type PluginInjectableTag =
  | PluginInjectableStylesheet
  | PluginInjectableLink
  | PluginInjectableMeta;

/**
 * Can return `undefined` if the plugin doesn't need to do anything. Useful if you want to disable the plugin with some
 * specific options for example.
 */
export type Plugin = (siteMeta: XenonExpressSiteMeta) =>
  | {
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
    }
  | undefined;
