import cx from "classnames";
import type { Toc } from "@stefanprobst/rehype-extract-toc";
import { BlogArticleTableOfContents } from "./BlogArticleTableOfContents";

export type TableOfContentsProps = {
  tableOfContents: Toc;
  id?: string | undefined;
  enableTopSeparator?: boolean | undefined;
};

export const TableOfContents = ({
  tableOfContents,
  id,
  enableTopSeparator,
}: TableOfContentsProps) => (
  <section
    className={cx(
      "toc-section",
      enableTopSeparator && "toc-section-top-separator",
    )}
  >
    {/* Make sure this matches `rehypeAutolinkHeadings` */}
    <h3 id={id} className="autolink-heading">
      Table of contents
      {id ? (
        <a className="autolink-link" aria-label="(permalink)" href={`#${id}`}>
          <span className="fas fa-link autolink-icon"></span>
        </a>
      ) : null}
    </h3>

    <BlogArticleTableOfContents tableOfContents={tableOfContents} depth={0} />
  </section>
);
