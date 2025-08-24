import type { Express } from "express";
import { transform } from "lightningcss";
import fs from "node:fs/promises";
import path from "node:path";
import type { PluginInjectableTag, Plugin } from "./plugins";

type SingleLightningCssPluginOptions = {
  inputFilepath: string;
  outputFilename: string;
  mountPointFragments?: string[];
};

export const singleLightningCssPlugin =
  ({
    inputFilepath,
    outputFilename,
    mountPointFragments = [],
  }: SingleLightningCssPluginOptions): Plugin =>
  () => {
    const pathname = `/${[...mountPointFragments, outputFilename].join("/")}`;

    // TODO: Do I need cache busting?
    // TODO: Some cache/watch would be nice
    // TODO: This is currently never 304 unlike express.static
    const compileCss = async () => {
      const code = await fs.readFile(path.join(inputFilepath));

      let { code: outputCode, warnings } = transform({
        filename: "index.css",
        code,
        minify: true,
        sourceMap: false,
      });

      if (warnings.length > 0) {
        console.warn(warnings);
      }

      return outputCode;
    };

    const attachToExpress = (app: Express) => {
      app.get(pathname, async (_req, res) => {
        const code = await compileCss();
        res.status(200).contentType("css").end(code);
      });
    };

    const build = async (baseOutputFolder: string) => {
      const outputFolder = path.join(baseOutputFolder, ...mountPointFragments);
      const outputFilepath = path.join(outputFolder, outputFilename);

      console.debug(
        `[Single Lightning CSS] ${inputFilepath} -> ${outputFilepath}`,
      );

      const [, code] = await Promise.all([
        await fs.mkdir(outputFolder, { recursive: true }),
        await compileCss(),
      ]);

      await fs.writeFile(outputFilepath, code);
    };

    const injectable: PluginInjectableTag[] = [
      {
        tagType: "preload" as const,
        as: "style" as const,
        href: pathname,
      },
      {
        tagType: "stylesheet" as const,
        href: pathname,
      },
    ];

    return {
      attachToExpress,
      build,
      injectable,
    };
  };
