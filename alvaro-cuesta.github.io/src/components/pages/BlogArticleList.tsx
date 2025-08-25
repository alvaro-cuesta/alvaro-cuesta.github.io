import { Template } from "../Template";
import { Link } from "../atoms/Link";
import { BlogListsLayout } from "../molecules/BlogListsLayout";
import { useBlogItems } from "../../blog/promise";
import { BlogArticleListItem } from "../molecules/BlogArticleListItem";
import type { SiteRenderMeta } from "../../site";
import { routeBlogArticleList } from "../../routes";

type BlogArticleListProps = {
  siteRenderMeta: SiteRenderMeta;
  /** Pass `null` to render as blog home -- i.e. page 1 but with a few tweaks */
  page: number | null;
};

export const BlogArticleList: React.FC<BlogArticleListProps> = ({
  siteRenderMeta,
  page: rawPage,
}) => {
  const blogItems = useBlogItems();

  const page = rawPage ?? 1;

  const itemsInPage = blogItems.allSortedByDescendingDateByPage.get(page);

  if (itemsInPage === undefined || itemsInPage.length === 0) {
    throw new Error(`Page ${page} not found`);
  }

  const totalPages = blogItems.allSortedByDescendingDateByPage.size;

  const prevPageLink = blogItems.allSortedByDescendingDateByPage.has(page - 1)
    ? routeBlogArticleList.build({ page: page - 1 === 1 ? null : page - 1 })
    : null;
  const nextPageLink = blogItems.allSortedByDescendingDateByPage.has(page + 1)
    ? routeBlogArticleList.build({ page: page + 1 })
    : null;

  // We allow linking to /blog/page/1 for consistency, but we add a canonical link to /blog
  const canonicalPathname = routeBlogArticleList.build({
    page: page === 1 ? null : page,
  });

  const description = `Álvaro Cuesta's personal blog${
    page !== 1 ? ` (page ${page})` : "."
  }`;

  return (
    <Template
      title="Blog"
      siteRenderMeta={siteRenderMeta}
      canonicalPathname={canonicalPathname}
      metaTags={
        <>
          <meta name="description" content={description} />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Álvaro Cuesta's Blog" />
          <meta property="og:description" content={description} />
          <meta property="og:image" content={siteRenderMeta.defaultOgImage} />
          <meta name="twitter:card" content="summary" />
        </>
      }
    >
      <BlogListsLayout
        breadcrumbs={
          page !== 1 && totalPages > 1
            ? [
                {
                  name: `Page ${page} of ${totalPages}`,
                  href: canonicalPathname,
                },
              ]
            : []
        }
        blogItems={blogItems}
      >
        <h2>Blog{page > 1 ? ` (page ${page} of ${totalPages})` : ""}</h2>

        <ul>
          {itemsInPage.map((item) => (
            <BlogArticleListItem key={item.filename} item={item} />
          ))}
        </ul>

        <div className="flex-space-between">
          {prevPageLink ? (
            <Link href={prevPageLink}>Previous page</Link>
          ) : (
            // We need a placeholder to keep the layout
            <div />
          )}
          {nextPageLink ? <Link href={nextPageLink}>Next page</Link> : null}
        </div>
      </BlogListsLayout>
    </Template>
  );
};
