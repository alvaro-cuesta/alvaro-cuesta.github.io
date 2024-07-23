import fs from "node:fs/promises";
import path from "node:path";
import { parseBlogItemModuleFromImportModule } from "./item-module";
import { suspendablePromiseMaker } from "xenon-ssg/src/promise";
import { analyzeBlogItems } from "./analyze";

const blogFolderPath = path.join(__dirname, "..", "..", "blog");

const { use, reset } = suspendablePromiseMaker(
  async () => {
    const blogFolderUrl = new URL(`../../blog/`, import.meta.url);

    const filelist = await fs.readdir(blogFolderPath);

    const importedItems = await Promise.all(
      filelist
        .filter((filename) => filename.endsWith(".mdx"))
        .map(async (filename) => {
          const fileUrl = new URL(filename, blogFolderUrl);
          const rawModule = await import(fileUrl.toString());
          const module = parseBlogItemModuleFromImportModule(
            filename,
            rawModule
          );

          return {
            filename,
            module,
          };
        })
    );

    const filteredImportedItems = importedItems.filter(
      (item) => process.env["NODE_ENV"] === "development" || !item.module.draft
    );

    return analyzeBlogItems(filteredImportedItems);
  },
  {
    lazy: true,
  }
);

const startWatch = async () => {
  for await (const _ of fs.watch(blogFolderPath)) {
    reset();
  }
};

startWatch();

export const useBlogItems = use;
