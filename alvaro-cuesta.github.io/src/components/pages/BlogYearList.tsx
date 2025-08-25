import { useBlogItems } from "../../blog/promise";
import { Template } from "../Template";
import { BlogListsLayout } from "../molecules/BlogListsLayout";
import { Link } from "../atoms/Link";
import type { SiteRenderMeta } from "../../site";
import { routeBlogYear, routeBlogYearList } from "../../routes";

type BlogYearListProps = {
  siteRenderMeta: SiteRenderMeta;
};

export const BlogYearList: React.FC<BlogYearListProps> = ({
  siteRenderMeta,
}) => {
  const blogItems = useBlogItems();

  const description = "Álvaro Cuesta's personal blog (all years)";

  return (
    <Template
      siteRenderMeta={siteRenderMeta}
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
        breadcrumbs={[{ name: "Years", href: routeBlogYearList.build({}) }]}
        blogItems={blogItems}
      >
        <h2>Years</h2>

        <ul>
          {blogItems.yearsSortedDescending.map(({ year, data }) => (
            <li key={year}>
              <Link href={routeBlogYear.build({ year })}>{year}</Link> (
              {data.totalCount})
            </li>
          ))}
        </ul>
      </BlogListsLayout>
    </Template>
  );
};
