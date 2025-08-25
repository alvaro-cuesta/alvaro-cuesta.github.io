import type { Express } from "express";
import type { XenonExpressSiteMeta } from "..";
import type { ReactNode } from "react";

export type PluginAttachToExpressFunction = (app: Express) => void;

export type PluginBuildPreOptions = {
  baseOutputFolder: string;
};

export type PluginBuildPreFunction<R = unknown> = (
  baseOutputFolder: PluginBuildPreOptions,
) => Promise<R>;

export type PluginGeneratedPage = {};

export type PluginBuildPostOptions = {
  baseOutputFolder: string;
};

export type PluginBuildPostFunction = (
  options: PluginBuildPostOptions,
) => Promise<void>;

export type PluginInjectableStylesheet = {
  tagType: "stylesheet";
  href: string;
  cachebust?: boolean;
};

export type PluginInjectableLink = {
  tagType: "link";
  rel: string;
  type?: string | undefined;
  title?: string | undefined;
  sizes?: string | undefined;
  media?: string | undefined;
  href: string;
  cachebust?: boolean;
};

export type PluginInjectableMeta = {
  tagType: "meta";
  name: string;
  content: string;
};

export type PluginInjectableTag = {
  critical?: boolean | undefined;
} & (PluginInjectableStylesheet | PluginInjectableLink | PluginInjectableMeta);

export type PluginGetInjectableFunction<R> = (
  /**
   * Value returned from {@link RunnablePlugin.buildPre}.
   *
   * Will be `undefined` if the plugin is running in dev mode.
   */
  buildPreResult: R | undefined,
) => PluginInjectableTag[] | undefined;

export type RunnablePlugin<R = unknown> = {
  /**
   * Attaches the plugin to Express during `dev` mode.
   */
  attachToExpress?: PluginAttachToExpressFunction;

  /**
   * Builds the plugin during `build` mode. Runs before the static site is generated.
   */
  buildPre?: PluginBuildPreFunction<R> | undefined;

  /**
   * Builds the plugin during `build` mode. Runs after the static site is generated.
   */
  buildPost?: PluginBuildPostFunction | undefined;

  /**
   * Injectable tags that can be used by the plugin.
   *
   * For example, a CSS file can be injected into the HTML head.
   */
  getInjectable?: PluginGetInjectableFunction<R> | undefined;
};

/**
 * Can return `undefined` if the plugin doesn't need to do anything. Useful if you want to disable the plugin with some
 * specific options for example.
 */
export type Plugin<R = unknown> = (
  siteMeta: XenonExpressSiteMeta,
) => RunnablePlugin<R> | undefined;

function renderInjectableRaw(tag: PluginInjectableTag, index: number) {
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
}

export function getTagsFromInjectableRaw(
  injectableRaw: PluginInjectableTag[],
): {
  injectable: ReactNode[];
  injectableCritical: ReactNode[];
} {
  return {
    injectable: injectableRaw
      .filter((x) => !x.critical)
      .map(renderInjectableRaw),
    injectableCritical: injectableRaw
      .filter((x) => x.critical)
      .map(renderInjectableRaw),
  };
}
