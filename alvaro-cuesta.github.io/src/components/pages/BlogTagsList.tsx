import { useBlogItems } from "../../blog/promise";
import { BlogListsLayout } from "../molecules/BlogListsLayout";
import { Template } from "../Template";
import { Link } from "../atoms/Link";
import type { SiteRenderMeta } from "../../site";
import { routeBlogTag, routeBlogTagList } from "../../routes";

type BlogTagListProps = {
  siteRenderMeta: SiteRenderMeta;
};

export const BlogTagList: React.FC<BlogTagListProps> = ({ siteRenderMeta }) => {
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
            content="Álvaro Cuesta's personal blog (all tags)"
          />
          <meta property="og:image" content={siteRenderMeta.defaultOgImage} />
          <meta name="twitter:card" content="summary" />
        </>
      }
    >
      <BlogListsLayout
        breadcrumbs={[{ name: "Tags", href: routeBlogTagList.build({}) }]}
        blogItems={blogItems}
      >
        <h2>Tags</h2>

        <ul>
          {blogItems.tagsAscendingAlphabetically.map(({ tag, items }) => (
            <li key={tag}>
              <Link href={routeBlogTag.build({ tag })}>{tag}</Link> (
              {items.length})
            </li>
          ))}
        </ul>
      </BlogListsLayout>
    </Template>
  );
};
