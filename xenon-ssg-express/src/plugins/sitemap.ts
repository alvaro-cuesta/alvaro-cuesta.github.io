import path from "node:path";
import fs from "node:fs/promises";
import { create } from "xmlbuilder2";
import type { Plugin, PluginBuildPostFunction } from "./plugins";
import type { Temporal } from "temporal-polyfill";

type SitemapPluginOptions = {
  outputFilename: string;
  mountPointFragments?: string[];
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
  }: SitemapPluginOptions): Plugin<void, SitemapPluginMetadata> =>
  () => {
    const buildPost: PluginBuildPostFunction<SitemapPluginMetadata> = async ({
      siteMeta,
      baseOutputFolder,
      generatedPages,
    }) => {
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
            .txt(
              `${siteMeta.baseUrl}${generatedPage.metadata[sitemapPluginKey].priority}`,
            );
        }
      }

      const xml = root.end();

      await fs.writeFile(outputFilepath, xml);
    };

    return {
      buildPost,
      getInjectable: undefined,
    };
  };
