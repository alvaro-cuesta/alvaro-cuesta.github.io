import { Express } from "express";
import favicons, { type FaviconOptions } from "favicons";
import { PluginReturn } from "./plugins";
import path from "node:path";
import fs from "node:fs/promises";
import { getFileHash } from "../crypto";

const LINK_REGEX =
  /<link\s+rel="(?<rel>.+?)"\s+(?:type="(?<type>.+?)"\s+)?(?:sizes="(?<sizes>.+?)"\s+)?(?:media="(?<media>.+?)"\s+)?href="(?<href>.+?)">/;

const META_REGEX = /<meta\s+name="(?<name>.+?)"\s+content="(?<content>.+?)">/;

const parseHtmlTag = (tag: string) => {
  const linkResult = LINK_REGEX.exec(tag);
  if (linkResult !== null) {
    return {
      type: "link" as const,
      rel: linkResult.groups!.rel,
      sizes: linkResult.groups!.sizes,
      media: linkResult.groups!.media,
      href: linkResult.groups!.href,
    };
  }

  const metaResult = META_REGEX.exec(tag);
  if (metaResult !== null) {
    return {
      type: "meta" as const,
      name: metaResult.groups!.name,
      content: metaResult.groups!.content,
    };
  }

  throw new Error(`Unknown tag: ${tag}`);
};

const getDefaultCacheBustingQueryParam = async (inputFilepath: string) => {
  const hash = await getFileHash(inputFilepath, "base64url");
  const partialHash = hash.slice(0, 8);

  return `v=${partialHash}`;
};

type FaviconPluginOptions = {
  inputFilepath: string;
  faviconOptions: FaviconOptions;
  mountPointFragments: string[];
};

export const faviconPlugin = async ({
  inputFilepath,
  faviconOptions,
  mountPointFragments,
}: FaviconPluginOptions): Promise<PluginReturn> => {
  // TODO: Some cache/watch would be nice -- this is currently taking several secs on every dev server restart

  // If the user didn't provide a custom cache-busting query param, add a default one based on the input file's content
  const cacheBustingQueryParam =
    faviconOptions.cacheBustingQueryParam ??
    (await getDefaultCacheBustingQueryParam(inputFilepath));

  const { images, files, html } = await favicons(inputFilepath, {
    ...faviconOptions,
    cacheBustingQueryParam,
  });

  const filesByName = {
    ...Object.fromEntries(images.map((image) => [image.name, image.contents])),
    ...Object.fromEntries(files.map((file) => [file.name, file.contents])),
  };

  const attachToExpress = (app: Express) => {
    app.use("/", (req, res, next) => {
      const pathFragments = req.path.split("/");

      if (pathFragments.length !== 2 || pathFragments[0] !== "") {
        next();
        return;
      }

      const filename = pathFragments[1];
      const content = filesByName[filename];

      if (content === undefined) {
        next();
        return;
      }

      res.status(200).contentType(filename).end(content);
    });
  };

  const build = async (baseOutputFolder: string) => {
    const outputFolder = path.join(baseOutputFolder, ...mountPointFragments);
    await fs.mkdir(outputFolder, { recursive: true });

    for (const image of images) {
      const outputFilepath = path.join(outputFolder, image.name);
      console.debug(`[Favicon Image] /${image.name} -> ${outputFilepath}`);
      await fs.writeFile(outputFilepath, image.contents);
    }

    for (const file of files) {
      const outputFilepath = path.join(outputFolder, file.name);
      console.debug(`[Favicon File] /${file.name} -> ${outputFilepath}`);
      await fs.writeFile(outputFilepath, file.contents);
    }
  };

  const injectable = html.map(parseHtmlTag);

  return {
    attachToExpress,
    build,
    injectable,
  };
};

/*

'<link rel="icon" type="image/x-icon" href="/favicon.ico">',
  '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
  '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
  '<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">',
  '<link rel="manifest" href="/manifest.webmanifest">',
  '<meta name="mobile-web-app-capable" content="yes">',
  '<meta name="theme-color" content="#fff">',
  '<meta name="application-name" content="Álvaro Cuesta">',
  '<link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon-57x57.png">',
  '<link rel="apple-touch-icon" sizes="60x60" href="/apple-touch-icon-60x60.png">',
  '<link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon-72x72.png">',
  '<link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png">',
  '<link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">',
  '<link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">',
  '<link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">',
  '<link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">',
  '<link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png">',
  '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">',
  '<link rel="apple-touch-icon" sizes="1024x1024" href="/apple-touch-icon-1024x1024.png">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
  '<meta name="apple-mobile-web-app-title" content="Álvaro Cuesta">',
  '<link rel="apple-touch-startup-image" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/apple-touch-startup-image-640x1136.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/apple-touch-startup-image-1136x640.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/apple-touch-startup-image-750x1334.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/apple-touch-startup-image-1334x750.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/apple-touch-startup-image-1125x2436.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/apple-touch-startup-image-2436x1125.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/apple-touch-startup-image-1170x2532.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/apple-touch-startup-image-2532x1170.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/apple-touch-startup-image-1179x2556.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/apple-touch-startup-image-2556x1179.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/apple-touch-startup-image-828x1792.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/apple-touch-startup-image-1792x828.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/apple-touch-startup-image-1242x2688.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/apple-touch-startup-image-2688x1242.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/apple-touch-startup-image-1242x2208.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/apple-touch-startup-image-2208x1242.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/apple-touch-startup-image-1284x2778.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/apple-touch-startup-image-2778x1284.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/apple-touch-startup-image-1290x2796.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/apple-touch-startup-image-2796x1290.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/apple-touch-startup-image-1488x2266.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/apple-touch-startup-image-2266x1488.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/apple-touch-startup-image-1536x2048.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/apple-touch-startup-image-2048x1536.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/apple-touch-startup-image-1620x2160.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/apple-touch-startup-image-2160x1620.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 820px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/apple-touch-startup-image-1640x2160.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 820px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/apple-touch-startup-image-2160x1640.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/apple-touch-startup-image-1668x2388.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/apple-touch-startup-image-2388x1668.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/apple-touch-startup-image-1668x2224.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/apple-touch-startup-image-2224x1668.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/apple-touch-startup-image-2048x2732.png">',
  '<link rel="apple-touch-startup-image" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/apple-touch-startup-image-2732x2048.png">',
  '<meta name="msapplication-TileColor" content="#13171f">',
  '<meta name="msapplication-TileImage" content="/mstile-144x144.png">',
  '<meta name="msapplication-config" content="/browserconfig.xml">',
  '<link rel="yandex-tableau-widget" href="/yandex-browser-manifest.json">';

  */
