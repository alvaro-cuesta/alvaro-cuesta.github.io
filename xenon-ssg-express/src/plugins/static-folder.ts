import path from "node:path";
import fs from "node:fs/promises";
import express from "express";
import type {
  Plugin,
  PluginAttachToExpressFunction,
  PluginBuildPreFunction,
} from "./plugins";

type StaticFolderPluginOptions = {
  inputFolder: string;
  mountPointFragments?: string[];
};

export const staticFolderPlugin =
  ({
    inputFolder,
    mountPointFragments = [],
  }: StaticFolderPluginOptions): Plugin =>
  () => {
    const pathname = `/${mountPointFragments.join("/")}`;

    const attachToExpress: PluginAttachToExpressFunction = (app) => {
      app.use(pathname, express.static(inputFolder));
    };

    const buildPre: PluginBuildPreFunction = async ({ baseOutputFolder }) => {
      const outputFolder = path.join(baseOutputFolder, ...mountPointFragments);

      console.debug(`[Static folder] ${inputFolder} -> ${outputFolder}`);

      await fs.cp(inputFolder, outputFolder, { recursive: true });
    };

    return {
      attachToExpress,
      buildPre,
    };
  };
