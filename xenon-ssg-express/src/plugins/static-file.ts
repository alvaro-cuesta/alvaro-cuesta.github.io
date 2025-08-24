import path from "node:path";
import fs from "node:fs/promises";
import express, { type Express } from "express";
import type { Plugin, GetInjectableFunction } from "./plugins";
import { getCacheBustingHash } from "../utils";

type StaticFilePluginOptions = {
  inputFilepath: string;
  outputFilename: string;
  mountPointFragments?: string[];
  injectAs?: "stylesheet";
};

export const staticFilePlugin =
  ({
    inputFilepath,
    outputFilename,
    mountPointFragments = [],
    injectAs,
  }: StaticFilePluginOptions): Plugin<string> =>
  () => {
    const pathname = `/${[...mountPointFragments, outputFilename].join("/")}`;

    const attachToExpress = (app: Express) => {
      app.use(pathname, express.static(inputFilepath));
    };

    const buildPre = async (baseOutputFolder: string) => {
      const outputFolder = path.join(baseOutputFolder, ...mountPointFragments);
      const outputFilepath = path.join(outputFolder, outputFilename);

      console.debug(`[Static file] ${inputFilepath} -> ${outputFilepath}`);

      await fs.mkdir(outputFolder, { recursive: true });
      await fs.cp(inputFilepath, outputFilepath);

      const content = await fs.readFile(inputFilepath);

      return getCacheBustingHash(content);
    };

    const getInjectable: GetInjectableFunction<string> | undefined =
      injectAs === "stylesheet"
        ? (cachebust) => [
            {
              tagType: "stylesheet" as const,
              href: cachebust ? `${pathname}?v=${cachebust}` : pathname,
            },
          ]
        : undefined;

    return {
      attachToExpress,
      buildPre,
      getInjectable,
    };
  };
