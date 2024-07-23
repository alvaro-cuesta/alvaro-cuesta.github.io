import { type ReactNode } from "react";
import cx from "classnames";
import { Link } from "./atoms/Link";
import { Icon } from "./atoms/Icon";
import { useBlogItems } from "../blog/promise";
import type { SiteRenderMeta } from "../site";

type TemplateProps = {
  siteRenderMeta: SiteRenderMeta;
  canonicalPathname?: string;
  canonicalUrl?: string;
  title?: string;
  metaTags?: ReactNode;
  mainClassName?: string;
  children?: ReactNode;
};

export const Template: React.FC<TemplateProps> = ({
  siteRenderMeta,
  canonicalPathname = siteRenderMeta.pathname,
  canonicalUrl = `${siteRenderMeta.origin}${siteRenderMeta.basepath}${canonicalPathname}`,
  title,
  metaTags,
  mainClassName,
  children,
}) => {
  const blogItems = useBlogItems();

  const fullTitle = title ? `${title} | Álvaro Cuesta` : "Álvaro Cuesta";
  const year = new Date().getFullYear();

  return (
    <html lang="en" prefix="og: http://ogp.me/ns#">
      <head>
        <meta charSet="utf-8" />
        <title>{fullTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
        <meta name="darkreader-lock" />
        {siteRenderMeta.injectable}
        <meta
          property="og:site_name"
          content="Álvaro Cuesta's personal website"
        />
        <meta property="og:url" content={canonicalUrl} />
        <link rel="canonical" href={canonicalUrl} />
        {metaTags}
      </head>
      <body>
        <header className="container">
          <nav>
            <ul>
              <li>
                <h1 className="marginless">
                  <Link href="/">Álvaro Cuesta</Link>
                </h1>
              </li>
            </ul>
            <ul>
              <li>
                <Link href="/#technologies">Tech</Link>
              </li>
              <li>
                <Link href="/#knowledge">Knowledge</Link>
              </li>
              <li>
                <Link href="/#projects">Projects</Link>
              </li>
              {blogItems.all.length > 0 ? (
                <li>
                  <Link href="/blog">Blog</Link>
                </li>
              ) : null}
            </ul>
          </nav>
        </header>
        <main className={cx("container", mainClassName)}>{children}</main>
        <footer className="container">
          <nav>
            <ul>
              <li>
                © {year} <Link href="/">Álvaro Cuesta</Link>
              </li>
            </ul>
            <ul>
              <li>
                <Link
                  href="https://github.com/alvaro-cuesta/"
                  aria-label="Álvaro Cuesta's GitHub (opens in new tab)"
                >
                  <Icon collection="fab" name="github" aria-hidden /> GitHub
                </Link>
              </li>
            </ul>
          </nav>
        </footer>
      </body>
    </html>
  );
};
