import fs from "node:fs/promises";
import path from "node:path";
import { generateStaticSite } from "xenon-ssg/src/generate/generate";
import { type XenonExpressSite, getSiteMeta } from ".";
import { getTagsFromInjectable } from "./plugins/plugins";

type BuildXenonSiteOptions = {
  outputDir?: string;
  entryPaths?: Iterable<string>;
};

/**
 * Builds a Xenon site.
 */
export const buildXenonExpressSite = async (
  site: XenonExpressSite,
  {
    outputDir = path.join(process.cwd(), "dist"),
    entryPaths = ["/"],
  }: BuildXenonSiteOptions = {},
) => {
  await fs.rm(outputDir, {
    recursive: true,
    force: true,
  });

  const siteMeta = getSiteMeta(site);
  const plugins = site.plugins
    .map((plugin) => plugin(siteMeta))
    .filter((x) => x !== undefined);

  console.debug("Running plugins (pre):");

  const injectableRaws = await Promise.all(
    plugins.map(async (runnablePlugin) => {
      const buildPreResult = await runnablePlugin.buildPre?.(outputDir);
      return runnablePlugin.getInjectable?.(buildPreResult) ?? [];
    }),
  );

  const injectableRaw = injectableRaws.flat();

  const injectable = getTagsFromInjectable(injectableRaw);

  console.debug("\nGenerating static site:");

  const render = (pathname: string) =>
    site.render({ ...siteMeta, pathname, injectableRaw, injectable });

  await generateStaticSite(render, {
    entryPaths: entryPaths,
    outputDir: outputDir,
    renderToStreamOptions: site.renderToStreamOptions,
  });

  console.debug("\nRunning plugins (post):");

  for (const plugin of plugins) {
    await plugin.buildPost?.(outputDir);
  }

  console.log("\nAll done!");
};
