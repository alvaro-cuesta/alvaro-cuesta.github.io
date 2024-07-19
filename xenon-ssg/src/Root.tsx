import React from "react";
import { Suspense } from "react";
import { LinkProvider, LinkProviderProps } from "./generate/LinkContext";

type RootProps = {
  children: React.ReactNode;
  addLink: LinkProviderProps["addLink"];
};

export const Root: React.FC<RootProps> = ({ children, addLink }) => (
  // A top-level suspense will help in case the user tries to use suspense features while not
  // providing their own suspense boundary
  <Suspense>
    <LinkProvider addLink={addLink}>{children}</LinkProvider>
  </Suspense>
);
