import fs from "node:fs/promises";
import path from "node:path";
import { generateStaticSite } from "xenon-ssg/src/generate/generate";
import { type XenonExpressSite, makeXenonRenderFromXenonExpressSite } from ".";

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
  }: BuildXenonSiteOptions = {}
) => {
  await fs.rm(outputDir, {
    recursive: true,
    force: true,
  });

  console.debug("Generating static site:");

  await generateStaticSite(makeXenonRenderFromXenonExpressSite(site), {
    entryPaths: entryPaths,
    outputDir: outputDir,
    renderToStreamOptions: site.renderToStreamOptions,
  });

  console.debug("\nRunning plugins:");

  // This must be in reverse order of middleware in dev.ts to ensure the same priority in case a file is overriden by
  // mistake. Unlikely to happen but better have the same behavior to avoid confusing differences between build and dev.
  const reversePlugins = site.plugins.slice().reverse();

  for (const plugin of reversePlugins) {
    await plugin.build(outputDir);
  }

  console.log("\nAll done!");
};
