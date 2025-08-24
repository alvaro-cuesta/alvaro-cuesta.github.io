import type { Express } from "express";
import type { XenonExpressSiteMeta } from "..";
import type { ReactNode } from "react";

export type GetInjectableFunction<BuildPreResult> = (
  /**
   * Value returned from {@link RunnablePlugin.buildPre}.
   *
   * Will be `undefined` if the plugin is running in dev mode.
   */
  buildPreResult: BuildPreResult | undefined,
) => PluginInjectableTag[] | undefined;

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

export type PluginInjectableTag =
  | PluginInjectableStylesheet
  | PluginInjectableLink
  | PluginInjectableMeta;

export type RunnablePlugin<R = unknown> = {
  /**
   * Attaches the plugin to Express during `dev` mode.
   */
  attachToExpress?: (app: Express) => void;

  /**
   * Builds the plugin during `build` mode. Runs before the static site is generated.
   */
  buildPre?: (baseOutputFolder: string) => Promise<R>;

  /**
   * Builds the plugin during `build` mode. Runs after the static site is generated.
   */
  buildPost?: (baseOutputFolder: string) => Promise<void>;

  /**
   * Injectable tags that can be used by the plugin.
   *
   * For example, a CSS file can be injected into the HTML head.
   */
  getInjectable?: GetInjectableFunction<R> | undefined;
};

/**
 * Can return `undefined` if the plugin doesn't need to do anything. Useful if you want to disable the plugin with some
 * specific options for example.
 */
export type Plugin<R = unknown> = (
  siteMeta: XenonExpressSiteMeta,
) => RunnablePlugin<R> | undefined;

export function getTagsFromInjectable(
  injectableRaw: PluginInjectableTag[],
): ReactNode[] {
  return injectableRaw.map((tag, index) => {
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
}
