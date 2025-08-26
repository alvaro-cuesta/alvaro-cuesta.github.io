import type { ReactNode } from "react";
import type { UnknownRecord } from "type-fest";

export type XenonRenderFunction = (pathname: string) => {
  reactNode: ReactNode;
  metadata?: UnknownRecord | undefined;
};
