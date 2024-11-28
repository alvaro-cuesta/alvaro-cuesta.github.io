import type { BlogItem } from "../../blog/item";
import { BlogArticleTableOfContents } from "./BlogArticleTableOfContents";
import { MDX_DEFAULT_COMPONENTS } from "../../mdx/mdx";

type BlogArticleContentProps = {
  article: BlogItem;
  /**
   * Useful if you want to disable the default components that are site-specific, e.g. for rendering into an RSS feed.
   */
  disableDefaultComponents?: boolean;
};

const TOC_PERMALINK_ID = "toc";

export const BlogArticleContent: React.FC<BlogArticleContentProps> = ({
  article: {
    module: { Component, showTableOfContents, tableOfContents },
  },
  disableDefaultComponents = false,
}) => (
  <>
    {showTableOfContents ? (
      <section className="toc-section">
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
      <Component
        {...(!disableDefaultComponents
          ? { components: MDX_DEFAULT_COMPONENTS }
          : {})}
      />
    </section>
  </>
);
