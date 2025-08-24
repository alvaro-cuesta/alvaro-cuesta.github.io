import path from "node:path";
import fs from "node:fs/promises";
import express, { type Express } from "express";
import type { Plugin } from "./plugins";

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

    const attachToExpress = (app: Express) => {
      app.use(pathname, express.static(inputFolder));
    };

    const buildPre = async (baseOutputFolder: string) => {
      const outputFolder = path.join(baseOutputFolder, ...mountPointFragments);

      console.debug(`[Static folder] ${inputFolder} -> ${outputFolder}`);

      await fs.cp(inputFolder, outputFolder, { recursive: true });
    };

    return {
      attachToExpress,
      buildPre,
    };
  };
