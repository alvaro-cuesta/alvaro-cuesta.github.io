import type { BlogItem } from "../../blog/item";
import { Link } from "../atoms/Link";
import { BlogDateTime } from "../atoms/BlogDateTime";

type BlogArticleListItemProps = {
  item: BlogItem;
};

export const BlogArticleListItem: React.FC<BlogArticleListItemProps> = ({
  item: {
    module: { title, publicationDate, draft, slug },
  },
}) => (
  <li>
    [<BlogDateTime dropTime dateTime={publicationDate} />]{" "}
    <b>
      <Link href={`/blog/${slug}`}>{title}</Link>
    </b>
    {draft ? " (draft)" : ""}
  </li>
);
