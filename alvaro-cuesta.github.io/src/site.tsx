import { Homepage } from "./components/pages/Homepage";
import { NotFound } from "./components/pages/NotFound";
import type {
  XenonExpressRenderMeta,
  XenonExpressSite,
} from "xenon-ssg-express/src";
import { RENDER_TO_STREAM_OPTIONS } from "../config";
import { staticFilePlugin } from "xenon-ssg-express/src/plugins/static-file";
import { staticFolderPlugin } from "xenon-ssg-express/src/plugins/static-folder";
import { singleLightningCssPlugin } from "xenon-ssg-express/src/plugins/single-lightningcss";
import path from "node:path";
import { faviconPlugin } from "xenon-ssg-express/src/plugins/favicon";
import { version } from "../package.json" with { type: "json" };
import type { PluginInjectableLink } from "xenon-ssg-express/src/plugins/plugins";
import { BlogArticleList } from "./components/pages/BlogArticleList";
import { BlogTagList } from "./components/pages/BlogTagsList";
import { BlogTag } from "./components/pages/BlogTag";
import { BlogYearList } from "./components/pages/BlogYearList";
import { BlogYear } from "./components/pages/BlogYear";
import { BlogArticle } from "./components/pages/BlogArticle";

export type SiteRenderMeta = XenonExpressRenderMeta & {
  defaultOgImage: string;
};

const render = (renderMeta: XenonExpressRenderMeta) => {
  const defaultOgImageHref = renderMeta.injectableRaw?.find(
    (tag): tag is PluginInjectableLink =>
      tag.tagType === "link" &&
      tag.rel === "apple-touch-icon" &&
      tag.sizes === "1024x1024",
  )?.href;

  if (!defaultOgImageHref) {
    throw new Error(
      "Default og:image not found -- possibly the `favicon` plugin is missing or misconfigured",
    );
  }

  const siteRenderMeta = {
    ...renderMeta,
    defaultOgImage: `${renderMeta.origin}${renderMeta.basepath}${defaultOgImageHref}`,
  };

  if (renderMeta.pathname === "/") {
    return <Homepage siteRenderMeta={siteRenderMeta} />;
  }

  if (renderMeta.pathname === "/404.html") {
    return <NotFound siteRenderMeta={siteRenderMeta} />;
  }

  const blogPageMatch = renderMeta.pathname.match(
    /^\/blog(?:\/page\/(?<page>\d+))?$/,
  );
  if (blogPageMatch) {
    const pageParam = blogPageMatch.groups!["page"];
    const page = pageParam ? parseInt(pageParam, 10) : null;

    return <BlogArticleList siteRenderMeta={siteRenderMeta} page={page} />;
  }

  if (renderMeta.pathname === "/blog/tags") {
    return <BlogTagList siteRenderMeta={siteRenderMeta} />;
  }

  const tagMatch = renderMeta.pathname.match(/^\/blog\/tags\/(?<tag>.+)$/);
  if (tagMatch) {
    const tag = decodeURIComponent(tagMatch.groups!["tag"]!); // `!` is fine because the group is non-optional

    return <BlogTag siteRenderMeta={siteRenderMeta} tag={tag} />;
  }

  if (renderMeta.pathname === "/blog/years") {
    return <BlogYearList siteRenderMeta={siteRenderMeta} />;
  }

  const yearMatch = renderMeta.pathname.match(/^\/blog\/years\/(?<year>\d+)$/);
  if (yearMatch) {
    const year = parseInt(
      yearMatch.groups!["year"]!, // `!` is fine because the group is non-optional
      10,
    );

    return <BlogYear siteRenderMeta={siteRenderMeta} year={year} />;
  }

  const articleMatch = renderMeta.pathname.match(
    /^\/blog\/(?<slug>[a-z0-9-]+)$/,
  );
  if (articleMatch) {
    const slug = decodeURIComponent(articleMatch.groups!["slug"]!); // `!` is fine because the group is non-optional

    return <BlogArticle siteRenderMeta={siteRenderMeta} slug={slug} />;
  }

  throw new Error(`Path not found: ${renderMeta.pathname}`);
};

const PICO_FILE = "pico.blue.min.css";
const PICO_FILE_PATH = require.resolve(`@picocss/pico/css/${PICO_FILE}`);
export const picoCss = staticFilePlugin({
  inputFilepath: PICO_FILE_PATH,
  outputFilename: PICO_FILE,
  mountPointFragments: ["css", "pico"],
  injectAs: "stylesheet",
});

const FONTAWESOME_FILE = "all.min.css";
const FONTAWESOME_FILE_PATH = require.resolve(
  `fontawesome-free/css/${FONTAWESOME_FILE}`,
);
export const fontAwesomeCss = staticFilePlugin({
  inputFilepath: FONTAWESOME_FILE_PATH,
  outputFilename: FONTAWESOME_FILE,
  mountPointFragments: ["css", "fontawesome", "css"],
  injectAs: "stylesheet",
});

const FONTAWESOME_WEBFONTS_PATH = path.join(
  require.resolve("fontawesome-free"),
  "..", // @hack for some reason main is `attribution.js`
  "webfonts",
);
export const fontawesomeWebfontsFolder = staticFolderPlugin({
  inputFolder: FONTAWESOME_WEBFONTS_PATH,
  mountPointFragments: ["css", "fontawesome", "webfonts"],
});

const STATIC_FOLDER = path.join(__dirname, "..", "static");
export const staticFolder = staticFolderPlugin({
  inputFolder: STATIC_FOLDER,
});

const INDEX_CSS_PATH = path.join(__dirname, "index.css");
export const indexCss = singleLightningCssPlugin({
  inputFilepath: INDEX_CSS_PATH,
  outputFilename: "index.min.css",
  mountPointFragments: ["css"],
});

const STARRY_NIGHT_FILE = "both";
const STARRY_NIGHT_FILE_PATH = require.resolve(
  `@wooorm/starry-night/style/${STARRY_NIGHT_FILE}`,
);
export const starryNightCss = staticFilePlugin({
  inputFilepath: STARRY_NIGHT_FILE_PATH,
  outputFilename: `${STARRY_NIGHT_FILE}.css`,
  mountPointFragments: ["css", "starry-night"],
  injectAs: "stylesheet",
});

export const makeSite = async (): Promise<XenonExpressSite> => {
  const favicon = await faviconPlugin({
    inputFilepath: path.join(__dirname, "favicon.svg"),
    faviconOptions: {
      appName: "Álvaro Cuesta",
      appShortName: "Álvaro Cuesta",
      appDescription: "Álvaro Cuesta's personal website",
      developerName: "Álvaro Cuesta",
      developerURL: "https://github.com/alvaro-cuesta",
      background: "#13171f", // --pico-background-color
      theme_color: "#8999f9", // --pico-color
      display: "browser",
      version,
    },
    mountPointFragments: ["/"],
  });

  return {
    render,
    renderToStreamOptions: RENDER_TO_STREAM_OPTIONS,
    plugins: [
      favicon,
      staticFolder,
      picoCss,
      fontAwesomeCss,
      fontawesomeWebfontsFolder,
      indexCss,
      starryNightCss,
    ],
  };
};
