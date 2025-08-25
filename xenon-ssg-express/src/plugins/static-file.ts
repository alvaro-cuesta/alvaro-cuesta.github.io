import path from "node:path";
import fs from "node:fs/promises";
import express, { type Express } from "express";
import type {
  Plugin,
  PluginBuildPreFunction,
  PluginGetInjectableFunction,
} from "./plugins";
import {
  getCacheBustedFilename,
  getCacheBustingFragmentFile,
} from "../cache-busting";

type StaticFilePluginOptions = {
  inputFilepath: string;
  outputFilename: string;
  mountPointFragments?: string[];
  injectAs?: "stylesheet";
  /**
   * - `string` to manually control fragment
   * - `false` to disable cache busting
   * - `undefined` to calculate from input file hash
   */
  cacheBustingFragment?: string | false | undefined;
};

type StaticFilePluginBuildPreResult = { cacheBustedPathname: string };

export const staticFilePlugin =
  ({
    inputFilepath,
    outputFilename,
    mountPointFragments = [],
    injectAs,
    cacheBustingFragment,
  }: StaticFilePluginOptions): Plugin<StaticFilePluginBuildPreResult> =>
  () => {
    const pathname = `/${[...mountPointFragments, outputFilename].join("/")}`;

    const attachToExpress = (app: Express) => {
      app.use(pathname, express.static(inputFilepath));
    };

    const buildPre: PluginBuildPreFunction<
      StaticFilePluginBuildPreResult
    > = async ({ baseOutputFolder }) => {
      console.debug(`[Static file] ${inputFilepath}`);

      const outputFolder = path.join(baseOutputFolder, ...mountPointFragments);
      await fs.mkdir(outputFolder, { recursive: true });

      let realOutputFilename;
      if (cacheBustingFragment === undefined) {
        const fragment = await getCacheBustingFragmentFile(inputFilepath);
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

      return {
        cacheBustedPathname: `/${[...mountPointFragments, realOutputFilename].join("/")}`,
      };
    };

    const getInjectable:
      | PluginGetInjectableFunction<StaticFilePluginBuildPreResult>
      | undefined =
      injectAs === "stylesheet"
        ? (buildPreResult) => [
            {
              tagType: "stylesheet" as const,
              href: buildPreResult?.cacheBustedPathname ?? pathname,
            },
          ]
        : undefined;

    return {
      attachToExpress,
      buildPre,
      getInjectable,
    };
  };
