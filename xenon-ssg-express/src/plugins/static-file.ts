import path from "node:path";
import fs from "node:fs/promises";
import express, { type Express } from "express";
import type { PluginInjectableTag, Plugin } from "./plugins";

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
  }: StaticFilePluginOptions): Plugin =>
  () => {
    // TODO: Do I need cache busting?
    const pathname = `/${[...mountPointFragments, outputFilename].join("/")}`;

    const attachToExpress = (app: Express) => {
      app.use(pathname, express.static(inputFilepath));
    };

    const build = async (baseOutputFolder: string) => {
      const outputFolder = path.join(baseOutputFolder, ...mountPointFragments);
      const outputFilepath = path.join(outputFolder, outputFilename);

      console.debug(`[Static file] ${inputFilepath} -> ${outputFilepath}`);

      await fs.mkdir(outputFolder, { recursive: true });
      await fs.cp(inputFilepath, outputFilepath);
    };

    const injectable: PluginInjectableTag[] | undefined =
      injectAs === "stylesheet"
        ? [
            {
              tagType: "preload" as const,
              as: "style" as const,
              href: pathname,
            },
            {
              tagType: "stylesheet" as const,
              href: pathname,
            },
          ]
        : undefined;

    return {
      attachToExpress,
      build,
      injectable,
    };
  };
