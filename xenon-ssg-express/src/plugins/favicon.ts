import type { Express } from "express";
import favicons, { type FaviconOptions } from "favicons";
import type { PluginInjectableTag, Plugin } from "./plugins";
import path from "node:path";
import fs from "node:fs/promises";
import {
  getCacheBustedFilename,
  getCacheBustingFragmentFile,
} from "../cache-busting";

const LINK_REGEX =
  /<link\s+rel="(?<rel>.+?)"\s+(?:type="(?<type>.+?)"\s+)?(?:sizes="(?<sizes>.+?)"\s+)?(?:media="(?<media>.+?)"\s+)?href="(?<href>.+?)">/;

const META_REGEX = /<meta\s+name="(?<name>.+?)"\s+content="(?<content>.+?)">/;

const makeParseHtmlTag =
  (cacheBustingFragment?: string) =>
  (tag: string): PluginInjectableTag => {
    const linkResult = LINK_REGEX.exec(tag);
    if (linkResult !== null) {
      const href = linkResult.groups!["href"]!; // `!` is fine because it's marked as non-optional group in the regex

      return {
        tagType: "link" as const,
        rel: linkResult.groups!["rel"]!, // `!` is fine because it's marked as non-optional group in the regex
        sizes: linkResult.groups!["sizes"],
        media: linkResult.groups!["media"],
        href: cacheBustingFragment
          ? getCacheBustedFilename(href, cacheBustingFragment)
          : href,
      };
    }

    const metaResult = META_REGEX.exec(tag);
    if (metaResult !== null) {
      return {
        tagType: "meta" as const,
        name: metaResult.groups!["name"]!, // `!` is fine because it's marked as non-optional group in the regex
        content: metaResult.groups!["content"]!, // `!` is fine because it's marked as non-optional group in the regex
      };
    }

    throw new Error(`Unknown tag: ${tag}`);
  };

type FaviconPluginOptions = {
  inputFilepath: string;
  faviconOptions: Omit<FaviconOptions, "cacheBustingQueryParam">;
  mountPointFragments?: string[];
  /**
   * - `string` to manually control fragment
   * - `false` to disable cache busting
   * - `undefined` to calculate from input file hash
   */
  cacheBustingFragment?: string | false | undefined;
};

export const faviconPlugin = async ({
  inputFilepath,
  faviconOptions,
  mountPointFragments = [],
  cacheBustingFragment,
}: FaviconPluginOptions): Promise<Plugin> => {
  // TODO: Some cache/watch would be nice -- this is currently taking several secs on every dev server restart

  const realCacheBustingFragment =
    cacheBustingFragment === undefined
      ? await getCacheBustingFragmentFile(inputFilepath)
      : cacheBustingFragment === false
        ? undefined
        : cacheBustingFragment;

  const { images, files, html } = await favicons(inputFilepath, faviconOptions);

  const filesByName = {
    ...Object.fromEntries(images.map((image) => [image.name, image.contents])),
    ...Object.fromEntries(files.map((file) => [file.name, file.contents])),
  };

  const attachToExpress = (app: Express) => {
    app.use(`/${mountPointFragments.join("/")}`, (req, res, next) => {
      const pathFragments = req.path.split("/");

      if (pathFragments.length !== 2 || pathFragments[0] !== "") {
        next();
        return;
      }

      const filename = pathFragments[1]!; // `!` is okay because we checked the length
      const content = filesByName[filename];

      if (content === undefined) {
        next();
        return;
      }

      res.status(200).contentType(filename).end(content);
    });
  };

  const buildPre = async (baseOutputFolder: string) => {
    const outputFolder = path.join(baseOutputFolder, ...mountPointFragments);
    await fs.mkdir(outputFolder, { recursive: true });

    for (const image of images) {
      const outputFilepath = path.join(
        outputFolder,
        realCacheBustingFragment
          ? getCacheBustedFilename(image.name, realCacheBustingFragment)
          : image.name,
      );
      console.debug(`[Favicon Image] /${image.name} -> ${outputFilepath}`);
      await fs.writeFile(outputFilepath, image.contents);
    }

    for (const file of files) {
      const outputFilepath = path.join(
        outputFolder,
        realCacheBustingFragment
          ? getCacheBustedFilename(file.name, realCacheBustingFragment)
          : file.name,
      );
      console.debug(`[Favicon File] /${file.name} -> ${outputFilepath}`);
      await fs.writeFile(outputFilepath, file.contents);
    }
  };

  const getInjectable = () =>
    html.map(makeParseHtmlTag(realCacheBustingFragment));

  return () => ({
    attachToExpress,
    buildPre,
    getInjectable,
  });
};
