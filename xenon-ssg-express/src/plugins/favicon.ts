import { Express } from "express";
import favicons, { type FaviconOptions } from "favicons";
import { PluginReturn } from "./plugins";
import path from "node:path";
import fs from "node:fs/promises";
import { getFileHash } from "../crypto";

const LINK_REGEX =
  /<link\s+rel="(?<rel>.+?)"\s+(?:type="(?<type>.+?)"\s+)?(?:sizes="(?<sizes>.+?)"\s+)?(?:media="(?<media>.+?)"\s+)?href="(?<href>.+?)">/;

const META_REGEX = /<meta\s+name="(?<name>.+?)"\s+content="(?<content>.+?)">/;

const parseHtmlTag = (tag: string) => {
  const linkResult = LINK_REGEX.exec(tag);
  if (linkResult !== null) {
    return {
      type: "link" as const,
      rel: linkResult.groups!.rel,
      sizes: linkResult.groups!.sizes,
      media: linkResult.groups!.media,
      href: linkResult.groups!.href,
    };
  }

  const metaResult = META_REGEX.exec(tag);
  if (metaResult !== null) {
    return {
      type: "meta" as const,
      name: metaResult.groups!.name,
      content: metaResult.groups!.content,
    };
  }

  throw new Error(`Unknown tag: ${tag}`);
};

const getDefaultCacheBustingQueryParam = async (inputFilepath: string) => {
  const hash = await getFileHash(inputFilepath, "base64url");
  const partialHash = hash.slice(0, 8);

  return `v=${partialHash}`;
};

type FaviconPluginOptions = {
  inputFilepath: string;
  faviconOptions: FaviconOptions;
  mountPointFragments: string[];
};

export const faviconPlugin = async ({
  inputFilepath,
  faviconOptions,
  mountPointFragments,
}: FaviconPluginOptions): Promise<PluginReturn> => {
  // TODO: Some cache/watch would be nice -- this is currently taking several secs on every dev server restart

  // If the user didn't provide a custom cache-busting query param, add a default one based on the input file's content
  const cacheBustingQueryParam =
    faviconOptions.cacheBustingQueryParam ??
    (await getDefaultCacheBustingQueryParam(inputFilepath));

  const { images, files, html } = await favicons(inputFilepath, {
    ...faviconOptions,
    cacheBustingQueryParam,
  });

  const filesByName = {
    ...Object.fromEntries(images.map((image) => [image.name, image.contents])),
    ...Object.fromEntries(files.map((file) => [file.name, file.contents])),
  };

  const attachToExpress = (app: Express) => {
    app.use("/", (req, res, next) => {
      const pathFragments = req.path.split("/");

      if (pathFragments.length !== 2 || pathFragments[0] !== "") {
        next();
        return;
      }

      const filename = pathFragments[1];
      const content = filesByName[filename];

      if (content === undefined) {
        next();
        return;
      }

      res.status(200).contentType(filename).end(content);
    });
  };

  const build = async (baseOutputFolder: string) => {
    const outputFolder = path.join(baseOutputFolder, ...mountPointFragments);
    await fs.mkdir(outputFolder, { recursive: true });

    for (const image of images) {
      const outputFilepath = path.join(outputFolder, image.name);
      console.debug(`[Favicon Image] /${image.name} -> ${outputFilepath}`);
      await fs.writeFile(outputFilepath, image.contents);
    }

    for (const file of files) {
      const outputFilepath = path.join(outputFolder, file.name);
      console.debug(`[Favicon File] /${file.name} -> ${outputFilepath}`);
      await fs.writeFile(outputFilepath, file.contents);
    }
  };

  const injectable = html.map(parseHtmlTag);

  return {
    attachToExpress,
    build,
    injectable,
  };
};
