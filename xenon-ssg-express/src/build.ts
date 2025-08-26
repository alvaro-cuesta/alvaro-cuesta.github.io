import fs from "node:fs/promises";
import path from "node:path";
import { generateStaticSite } from "xenon-ssg/src/generate/generate";
import { type XenonExpressSite, getSiteMeta } from ".";
import { getTagsFromInjectableRaw } from "./plugins/plugins";
import type { UnknownRecord } from "type-fest";

type BuildXenonSiteOptions = {
  outputDir?: string;
  entryPaths?: Iterable<string>;
};

/**
 * Builds a Xenon site.
 */
export async function buildXenonExpressSite<PageMetadata extends UnknownRecord>(
  site: XenonExpressSite<PageMetadata>,
  {
    outputDir = path.join(process.cwd(), "dist"),
    entryPaths = ["/"],
  }: BuildXenonSiteOptions = {},
) {
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
      const buildPreResult = await runnablePlugin.buildPre?.({
        siteMeta,
        baseOutputFolder: outputDir,
      });
      return runnablePlugin.getInjectable?.(buildPreResult) ?? [];
    }),
  );

  const injectableRaw = injectableRaws.flat();

  const { injectable, injectableCritical } =
    getTagsFromInjectableRaw(injectableRaw);

  console.debug("\nGenerating static site:");

  const render = (pathname: string) =>
    site.render({
      ...siteMeta,
      pathname,
      injectableRaw,
      injectable,
      injectableCritical,
    });

  const generatedPages = await generateStaticSite(render, {
    entryPaths: entryPaths,
    outputDir: outputDir,
    renderToStreamOptions: site.renderToStreamOptions,
  });

  console.debug("\nRunning plugins (post):");

  for (const plugin of plugins) {
    await plugin.buildPost?.({
      siteMeta,
      baseOutputFolder: outputDir,
      generatedPages,
    });
  }

  console.log("\nAll done!");
}
