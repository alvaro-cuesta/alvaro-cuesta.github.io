import { useBlogItems } from "../../blog/promise";
import { Template } from "../Template";
import { BlogListsLayout } from "../molecules/BlogListsLayout";
import { Link } from "../atoms/Link";
import type { SiteRenderMeta } from "../../site";

type BlogYearListProps = {
  siteRenderMeta: SiteRenderMeta;
};

export const BlogYearList: React.FC<BlogYearListProps> = ({
  siteRenderMeta,
}) => {
  const blogItems = useBlogItems();

  return (
    <Template
      siteRenderMeta={siteRenderMeta}
      metaTags={
        <>
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Álvaro Cuesta's Blog" />
          <meta
            property="og:description"
            content="Álvaro Cuesta's personal blog (all years)"
          />
          <meta property="og:image" content={siteRenderMeta.defaultOgImage} />
          <meta name="twitter:card" content="summary" />
        </>
      }
    >
      <BlogListsLayout
        breadcrumbs={[{ name: "Years", href: "/blog/years" }]}
        blogItems={blogItems}
      >
        <h2>Years</h2>

        <ul>
          {blogItems.yearsSortedDescending.map(({ year, data }) => (
            <li key={year}>
              <Link href={`/blog/years/${year}`}>{year}</Link> (
              {data.totalCount})
            </li>
          ))}
        </ul>
      </BlogListsLayout>
    </Template>
  );
};
