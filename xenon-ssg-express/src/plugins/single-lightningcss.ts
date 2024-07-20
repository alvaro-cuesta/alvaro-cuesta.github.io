import { Express } from "express";
import { transform } from "lightningcss";
import fs from "node:fs/promises";
import path from "node:path";
import { PluginReturn } from "./plugins";

type SingleLightningCssPluginOptions = {
  inputFilepath: string;
  outputFilename: string;
  mountPointFragments: string[];
};

export const singleLightningCssPlugin = ({
  inputFilepath,
  outputFilename,
  mountPointFragments,
}: SingleLightningCssPluginOptions): PluginReturn => {
  const pathname = `/${mountPointFragments.join("/")}/${outputFilename}`;

  // TODO: Some cache/watch would be nice
  const compileCss = async () => {
    const code = await fs.readFile(path.join(inputFilepath));

    let { code: outputCode } = transform({
      filename: "index.css",
      code,
      minify: true,
      sourceMap: false,
    });

    return outputCode;
  };

  const attachToExpress = (app: Express) => {
    app.get(pathname, async (req, res) => {
      const code = await compileCss();
      res.status(200).contentType("css").end(code);
    });
  };

  const build = async (baseOutputFolder: string) => {
    const outputFolder = path.join(baseOutputFolder, ...mountPointFragments);
    const outputFilepath = path.join(outputFolder, outputFilename);

    console.debug(
      `[Single Lightning CSS] ${inputFilepath} -> ${outputFilepath}`
    );

    const [, code] = await Promise.all([
      await fs.mkdir(outputFolder, { recursive: true }),
      await compileCss(),
    ]);

    await fs.writeFile(outputFilepath, code);
  };

  const injectable = [
    {
      type: "stylesheet" as const,
      href: pathname,
    },
  ];

  return {
    attachToExpress,
    build,
    injectable,
  };
};
