import { Template } from "../Template";
import type { SiteRenderMeta } from "../../site";

type NotFoundProps = {
  siteRenderMeta: SiteRenderMeta;
};

export const NotFound: React.FC<NotFoundProps> = ({ siteRenderMeta }) => (
  <Template siteRenderMeta={siteRenderMeta} title="Not found">
    <main className="container">
      <h2>Not found</h2>
      <p>The page you are looking for does not exist.</p>
    </main>
  </Template>
);
