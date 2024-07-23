import { Template } from "../Template";
import { Link } from "../atoms/Link";
import { BlogListsLayout } from "../molecules/BlogListsLayout";
import { useBlogItems } from "../../blog/promise";
import React from "react";
import { MDX_DEFAULT_COMPONENTS } from "../../mdx/mdx";
import {
  blogItemDateToUTCISO8601Z,
  equalsBlogItemDates,
} from "../../blog/item-dates";
import { BlogArticleTableOfContents } from "../molecules/BlogArticleTableOfContents";
import type { SiteRenderMeta } from "../../site";
import { BlogDateTime } from "../atoms/BlogDateTime";
import { Icon } from "../atoms/Icon";

type BlogArticleProps = {
  siteRenderMeta: SiteRenderMeta;
  slug: string;
};

const TOC_PERMALINK_ID = "toc";

export const BlogArticle: React.FC<BlogArticleProps> = ({
  siteRenderMeta,
  slug,
}) => {
  const blogItems = useBlogItems();

  const article = blogItems.bySlug.get(slug);

  if (article === undefined) {
    throw new Error(`Article ${slug} not found`);
  }

  const {
    module: {
      title,
      publicationDate,
      lastModificationDate: lastModificationDateRaw,
      draft,
      tags,
      Component,
      showTableOfContents,
      tableOfContents,
    },
  } = article;

  const lastModificationDate =
    lastModificationDateRaw &&
    !equalsBlogItemDates(publicationDate, lastModificationDateRaw)
      ? lastModificationDateRaw
      : null;

  const lastModificationDateISOZ = lastModificationDate
    ? blogItemDateToUTCISO8601Z(lastModificationDate)
    : null;

  return (
    <Template
      siteRenderMeta={siteRenderMeta}
      metaTags={
        <>
          <meta property="og:type" content="article" />
          <meta property="og:title" content={title} />
          <meta property="og:image" content={siteRenderMeta.defaultOgImage} />
          <meta property="article:author" content="Álvaro Cuesta" />
          <meta
            property="article:published_time"
            content={blogItemDateToUTCISO8601Z(publicationDate)}
          />
          {lastModificationDateISOZ !== null ? (
            <>
              <meta
                property="article:modified_time"
                content={lastModificationDateISOZ}
              />
              <meta
                property="og:updated_time"
                content={lastModificationDateISOZ}
              />
            </>
          ) : null}
          {tags.map((tag) => (
            <meta property="article:tag" content={tag} key={tag} />
          ))}
          <meta name="twitter:card" content="summary" />
        </>
      }
    >
      <BlogListsLayout
        breadcrumbs={[{ name: title, href: `/blog/${slug}` }]}
        blogItems={blogItems}
      >
        <header>
          <div>
            <h2 className="no-underline">
              <Link href={`/blog/${slug}`}>{title}</Link>
              {draft ? " (draft)" : ""}
            </h2>
          </div>

          <div className="icon-field">
            <Icon fixedWidth name="calendar" title="Publication date" />{" "}
            <BlogDateTime dateTime={publicationDate} />
          </div>

          {tags.length > 0 && (
            <div className="icon-field">
              <Icon fixedWidth name="tags" title="Tags" />{" "}
              <span>
                {tags.map((tag, index) => (
                  <React.Fragment key={tag}>
                    {index > 0 && ", "}
                    <Link href={`/blog/tags/${tag}`}>{tag}</Link>
                  </React.Fragment>
                ))}
              </span>
            </div>
          )}
        </header>

        {showTableOfContents ? (
          <section>
            {/* Make sure this matches `rehypeAutolinkHeadings` */}
            <h3 id={TOC_PERMALINK_ID} className="autolink-heading">
              Table of contents
              <a
                className="autolink-link"
                aria-label="(permalink)"
                href={`#${TOC_PERMALINK_ID}`}
              >
                <span className="fas fa-link autolink-icon"></span>
              </a>
            </h3>

            <BlogArticleTableOfContents
              tableOfContents={tableOfContents}
              depth={0}
            />
          </section>
        ) : null}

        <section>
          <Component components={MDX_DEFAULT_COMPONENTS} />
        </section>

        {lastModificationDate ? (
          <footer>
            <i>
              (Last updated on <BlogDateTime dateTime={lastModificationDate} />)
            </i>
          </footer>
        ) : null}
      </BlogListsLayout>
    </Template>
  );
};
