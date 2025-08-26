import path from "node:path";
import fs from "node:fs/promises";
import { create } from "xmlbuilder2";
import type {
  Plugin,
  PluginAttachToExpressFunction,
  PluginBuildPostFunction,
  PluginGetInjectableFunction,
} from "./plugins";
import type { Temporal } from "temporal-polyfill";

type SitemapPluginOptions = {
  robotsTxtContent?: string;
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
    robotsTxtContent,
    outputFilename,
    mountPointFragments = [],
    disableInjectMetaTag,
  }: SitemapPluginOptions): Plugin<void, SitemapPluginMetadata> =>
  () => {
    const pathname = `/${[...mountPointFragments, outputFilename].join("/")}`;

    const attachToExpress: PluginAttachToExpressFunction | undefined =
      robotsTxtContent
        ? (app) => {
            app.get("/robots.txt", async (_req, res) => {
              res.status(200).contentType("text/plain").end(robotsTxtContent);
            });
          }
        : undefined;

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

      if (robotsTxtContent) {
        const realRobotsTxtContent = `${robotsTxtContent}
${robotsTxtContent.endsWith("\n") ? "" : "\n"}Sitemap: ${siteMeta.baseUrl}${pathname}\n`;

        const robotsTxtOutputFilepath = path.join(outputFolder, "robots.txt");
        console.debug(`[Sitemap] ${robotsTxtOutputFilepath}`);
        await fs.writeFile(robotsTxtOutputFilepath, realRobotsTxtContent);
      }
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
      attachToExpress,
      buildPost,
      getInjectable,
    };
  };
