import path from "node:path";
import fs from "node:fs/promises";
import express, { Express } from "express";
import { PluginReturn } from "./plugins";

type StaticFolderPluginOptions = {
  inputFolder: string;
  mountPointFragments: string[];
};

export const staticFolderPlugin = ({
  inputFolder,
  mountPointFragments,
}: StaticFolderPluginOptions): PluginReturn => {
  const pathname = `/${mountPointFragments.join("/")}`;

  const attachToExpress = (app: Express) => {
    app.use(pathname, express.static(inputFolder));
  };

  const build = async (baseOutputFolder: string) => {
    const outputFolder = path.join(baseOutputFolder, ...mountPointFragments);

    console.debug(`[Static folder] ${inputFolder} -> ${outputFolder}`);

    await fs.cp(inputFolder, outputFolder, { recursive: true });
  };

  return {
    attachToExpress,
    build,
  };
};
