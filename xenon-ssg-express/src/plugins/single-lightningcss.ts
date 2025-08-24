import type { Express } from "express";
import { transform } from "lightningcss";
import fs from "node:fs/promises";
import path from "node:path";
import type { Plugin, GetInjectableFunction } from "./plugins";
import { getCacheBustedFilename, getCacheBustingHash } from "../cache-busting";

type SingleLightningCssPluginOptions = {
  inputFilepath: string;
  outputFilename: string;
  mountPointFragments?: string[];
  cacheBustingFragment?: string | false;
};

export const singleLightningCssPlugin =
  ({
    inputFilepath,
    outputFilename,
    mountPointFragments = [],
    cacheBustingFragment,
  }: SingleLightningCssPluginOptions): Plugin<string> =>
  () => {
    const pathname = `/${[...mountPointFragments, outputFilename].join("/")}`;

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

    const buildPre = async (baseOutputFolder: string) => {
      console.debug(`[Single Lightning CSS] ${inputFilepath}`);

      const outputFolder = path.join(baseOutputFolder, ...mountPointFragments);
      await fs.mkdir(outputFolder, { recursive: true });

      const code = await compileCss();

      let realOutputFilename;
      if (cacheBustingFragment === undefined) {
        const content = await fs.readFile(inputFilepath);
        const fragment = getCacheBustingHash(content);
        realOutputFilename = getCacheBustedFilename(outputFilename, fragment);
      } else if (cacheBustingFragment === false) {
        realOutputFilename = outputFilename;
      } else {
        realOutputFilename = getCacheBustedFilename(
          outputFilename,
          cacheBustingFragment,
        );
      }
      const outputFilepath = path.join(outputFolder, realOutputFilename);

      console.debug(
        `[Single Lightning CSS] ${inputFilepath} -> ${outputFilepath}`,
      );
      await fs.writeFile(outputFilepath, code);

      return outputFilepath;
    };

    const getInjectable: GetInjectableFunction<string> | undefined = (
      cacheBustedPathname,
    ) => [
      {
        tagType: "stylesheet" as const,
        href: cacheBustedPathname ?? pathname,
      },
    ];

    return {
      attachToExpress,
      buildPre,
      getInjectable,
    };
  };
