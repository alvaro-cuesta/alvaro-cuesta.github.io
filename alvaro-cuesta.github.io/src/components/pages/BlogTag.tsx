import { BlogListsLayout } from "../molecules/BlogListsLayout";
import { Template } from "../Template";
import { useBlogItems } from "../../blog/promise";
import { BlogArticleListItem } from "../molecules/BlogArticleListItem";
import type { SiteRenderMeta } from "../../site";
import { routeBlogTag, routeBlogTagList } from "../../routes";

type BlogTagProps = {
  siteRenderMeta: SiteRenderMeta;
  tag: string;
};

export const BlogTag: React.FC<BlogTagProps> = ({ siteRenderMeta, tag }) => {
  const blogItems = useBlogItems();

  const itemsInTag = blogItems.byTag.get(tag);

  if (itemsInTag === undefined) {
    throw new Error(`Tag ${tag} not found`);
  }

  // TODO: Pagination?

  const description = `Álvaro Cuesta's personal blog (tag "${tag})"`;

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
        breadcrumbs={[
          { name: "Tags", href: routeBlogTagList.build({}) },
          { name: tag, href: routeBlogTag.build({ tag }) },
        ]}
        blogItems={blogItems}
      >
        <h2>Tag "{tag}"</h2>

        <ul>
          {itemsInTag.map((item) => (
            <BlogArticleListItem key={item.filename} item={item} />
          ))}
        </ul>
      </BlogListsLayout>
    </Template>
  );
};
