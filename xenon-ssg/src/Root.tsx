import { Suspense, type ReactNode } from "react";
import { LinkProvider, type LinkProviderProps } from "./generate/LinkContext";

type RootProps = {
  children: ReactNode;
  addLink: LinkProviderProps["addLink"];
};

export const Root: React.FC<RootProps> = ({ children, addLink }) => (
  // A top-level suspense will help in case the user tries to use suspense features while not
  // providing their own suspense boundary
  <Suspense>
    <LinkProvider addLink={addLink}>{children}</LinkProvider>
  </Suspense>
);
