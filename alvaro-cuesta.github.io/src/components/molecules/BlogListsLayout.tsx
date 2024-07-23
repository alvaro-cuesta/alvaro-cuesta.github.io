import type { ReactNode } from "react";
import { BlogSidebar } from "./BlogSidebar";
import type { AnalyzedBlogItems } from "../../blog/analyze";
import { Breadcrumb, type BreadcrumbItem } from "../atoms/Breadcrumb";

type BlogListsLayoutProps = {
  breadcrumbs: BreadcrumbItem[];
  blogItems: AnalyzedBlogItems;
  children?: ReactNode;
};

export const BlogListsLayout: React.FC<BlogListsLayoutProps> = ({
  breadcrumbs,
  blogItems,
  children,
}) => (
  <>
    <div className="flex-responsive">
      <div className="bloglist-main">
        <Breadcrumb
          breadcrumbs={[
            {
              name: "Blog",
              href: "/blog",
            },
            ...breadcrumbs,
          ]}
        />
        <article>{children}</article>
      </div>
      <BlogSidebar blogItems={blogItems} />
    </div>
  </>
);
