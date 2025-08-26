import type { ReactNode } from "react";
import type { UnknownRecord } from "type-fest";

export type XenonRenderFunction<PageMetadata extends UnknownRecord> = (
  pathname: string,
) => {
  reactNode: ReactNode;
  metadata: PageMetadata;
};
