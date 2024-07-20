import express, { Express } from "express";
import { transform } from "lightningcss";
import fs from "node:fs/promises";
import path from "node:path";

type DefineCssFileOptions = {
  inputFilepath: string;
  outputFilename: string;
  mountPointFragments: string[];
};

type DefineCssReturn = {
  attachToExpress: (app: Express) => void;
  copy: (outputFolder: string) => Promise<void>;
  pathname: string;
};

export const defineCssFile = ({
  inputFilepath,
  outputFilename,
  mountPointFragments,
}: DefineCssFileOptions): DefineCssReturn => {
  const pathname = `/${mountPointFragments.join("/")}/${outputFilename}`;

  return {
    attachToExpress: (app: Express) => {
      app.use(pathname, express.static(inputFilepath));
    },
    copy: async (outputFolder: string) => {
      const outputParentFolder = path.join(
        outputFolder,
        ...mountPointFragments
      );

      await fs.mkdir(outputParentFolder, { recursive: true });
      await fs.cp(inputFilepath, path.join(outputParentFolder, outputFilename));
    },
    pathname,
  };
};

type DefineStaticFolderOptions = {
  inputFolder: string;
  mountPointFragments: string[];
};

type DefineStaticFolderReturn = {
  attachToExpress: (app: Express) => void;
  copy: (outputFolder: string) => Promise<void>;
};

export const defineStaticFolder = ({
  inputFolder,
  mountPointFragments,
}: DefineStaticFolderOptions): DefineStaticFolderReturn => {
  const pathname = `/${mountPointFragments.join("/")}`;

  return {
    attachToExpress: (app: Express) => {
      app.use(pathname, express.static(inputFolder));
    },
    copy: async (outputFolder: string) => {
      await fs.cp(
        inputFolder,
        path.join(outputFolder, ...mountPointFragments),
        { recursive: true }
      );
    },
  };
};

type DefineDynamicCssOptions = {
  inputFilepath: string;
  outputFilename: string;
  mountPointFragments: string[];
};

type DefineDynamicCssReturn = {
  attachToExpress: (app: Express) => void;
  copy: (outputFolder: string) => Promise<void>;
  pathname: string;
};

export const defineDynamicCss = ({
  inputFilepath,
  outputFilename,
  mountPointFragments,
}: DefineDynamicCssOptions): DefineDynamicCssReturn => {
  const pathname = `/${mountPointFragments.join("/")}/${outputFilename}`;

  const build = async () => {
    const code = await fs.readFile(path.join(inputFilepath));

    let { code: outputCode } = transform({
      filename: "index.css",
      code,
      minify: true,
      sourceMap: false,
    });

    return outputCode;
  };

  return {
    attachToExpress: (app: Express) => {
      app.get(pathname, async (req, res) => {
        const code = await build();
        res.status(200).contentType("css").end(code);
      });
    },
    copy: async (outputFolder: string) => {
      const outputParentFolder = path.join(
        outputFolder,
        ...mountPointFragments
      );

      const [, code] = await Promise.all([
        await fs.mkdir(outputParentFolder, { recursive: true }),
        await build(),
      ]);

      await fs.writeFile(path.join(outputParentFolder, outputFilename), code);
    },
    pathname,
  };
};
