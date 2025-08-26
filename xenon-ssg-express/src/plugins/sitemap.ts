import * as path from "node:path";
import * as fs from "node:fs/promises";
import { create } from "xmlbuilder2";
import type {
  Plugin,
  PluginBuildPostFunction,
  PluginGetInjectableFunction,
} from "./plugins";
import type { Temporal } from "temporal-polyfill";

type SitemapPluginOptions = {
  outputFilename: string;
  mountPointFragments?: string[];
  disableInjectMetaTag?: boolean;
};

export type SitemapPluginMetadata = {
  [sitemapPluginKey]?:
    | {
        lastModified?: Temporal.ZonedDateTime;
        changeFrequency?:
          | "always"
          | "hourly"
          | "daily"
          | "weekly"
          | "monthly"
          | "yearly"
          | "never";
        priority?: number | undefined;
      }
    | undefined;
};

export const sitemapPluginKey = Symbol("SitemapPlugin");

export const sitemapPlugin =
  ({
    outputFilename,
    mountPointFragments = [],
    disableInjectMetaTag,
  }: SitemapPluginOptions): Plugin<void, SitemapPluginMetadata> =>
  () => {
    const pathname = `/${[...mountPointFragments, outputFilename].join("/")}`;

    const buildPost: PluginBuildPostFunction<
      void,
      SitemapPluginMetadata
    > = async ({ siteMeta, baseOutputFolder, generatedPages }) => {
      const outputFolder = path.join(baseOutputFolder, ...mountPointFragments);
      await fs.mkdir(outputFolder, { recursive: true });

      const outputFilepath = path.join(outputFolder, outputFilename);
      console.debug(`[Sitemap] ${outputFilepath}`);

      const root = create({ version: "1.0", encoding: "UTF-8" });

      const urlset = root.ele("urlset", {
        xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
      });

      for (const generatedPage of generatedPages) {
        const url = urlset.ele("url");

        url.ele("loc").txt(`${siteMeta.baseUrl}${generatedPage.pathname}`);

        if (
          generatedPage.metadata[sitemapPluginKey]?.lastModified !== undefined
        ) {
          url
            .ele("lastmod")
            .txt(
              generatedPage.metadata[sitemapPluginKey].lastModified.toString(),
            );
        }

        if (
          generatedPage.metadata[sitemapPluginKey]?.changeFrequency !==
          undefined
        ) {
          url
            .ele("changefreq")
            .txt(generatedPage.metadata[sitemapPluginKey].changeFrequency);
        }

        if (generatedPage.metadata[sitemapPluginKey]?.priority !== undefined) {
          url
            .ele("priority")
            .txt(generatedPage.metadata[sitemapPluginKey].priority.toString());
        }
      }

      const xml = root.end();

      await fs.writeFile(outputFilepath, xml);
    };

    const getInjectable: PluginGetInjectableFunction<void> | undefined =
      !disableInjectMetaTag
        ? (options) =>
            options.isBuild
              ? [
                  {
                    tagType: "link",
                    rel: "sitemap",
                    type: "application/xml",
                    title: "Sitemap",
                    href: `${options.siteMeta.baseUrl}${pathname}`,
                  },
                ]
              : undefined
        : undefined;

    return {
      buildPost,
      getInjectable,
    };
  };
