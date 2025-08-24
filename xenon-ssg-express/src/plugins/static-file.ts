import path from "node:path";
import fs from "node:fs/promises";
import express, { type Express } from "express";
import type { Plugin, GetInjectableFunction } from "./plugins";
import { getCacheBustedFilename, getCacheBustingHash } from "../cache-busting";

type StaticFilePluginOptions = {
  inputFilepath: string;
  outputFilename: string;
  mountPointFragments?: string[];
  injectAs?: "stylesheet";
  cacheBustingFragment?: string | false;
};

export const staticFilePlugin =
  ({
    inputFilepath,
    outputFilename,
    mountPointFragments = [],
    injectAs,
    cacheBustingFragment,
  }: StaticFilePluginOptions): Plugin<string> =>
  () => {
    const pathname = `/${[...mountPointFragments, outputFilename].join("/")}`;

    const attachToExpress = (app: Express) => {
      app.use(pathname, express.static(inputFilepath));
    };

    const buildPre = async (baseOutputFolder: string) => {
      console.debug(`[Static file] ${inputFilepath}`);

      const outputFolder = path.join(baseOutputFolder, ...mountPointFragments);
      await fs.mkdir(outputFolder, { recursive: true });

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

      console.debug(`[Static file] ${inputFilepath} -> ${outputFilepath}`);
      await fs.cp(inputFilepath, outputFilepath);

      return outputFilepath;
    };

    const getInjectable: GetInjectableFunction<string> | undefined =
      injectAs === "stylesheet"
        ? (cacheBustedPathname) => [
            {
              tagType: "stylesheet" as const,
              href: cacheBustedPathname ?? pathname,
            },
          ]
        : undefined;

    return {
      attachToExpress,
      buildPre,
      getInjectable,
    };
  };
