import path from "node:path";
import fs from "node:fs/promises";
import { create } from "xmlbuilder2";
import type { Plugin, PluginBuildPostFunction } from "./plugins";

type SitemapPluginOptions = {
  outputFilename: string;
  mountPointFragments?: string[];
};

export const sitemapPlugin =
  ({
    outputFilename,
    mountPointFragments = [],
  }: SitemapPluginOptions): Plugin =>
  () => {
    const buildPost: PluginBuildPostFunction = async ({
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
        urlset
          .ele("url")
          .ele("loc")
          .txt(`${siteMeta.baseUrl}${generatedPage.pathname}`);
      }

      const xml = root.end();

      await fs.writeFile(outputFilepath, xml);
    };

    return {
      buildPost,
      getInjectable: undefined,
    };
  };
