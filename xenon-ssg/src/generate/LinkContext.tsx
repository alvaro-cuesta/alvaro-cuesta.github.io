import React, { useCallback } from "react";

type AddLink = (href: string) => void;

const LinkContext = React.createContext<AddLink | null>(null);

export type LinkProviderProps = {
  /**
   * Function to add a link to the list of links that the renderer will follow.
   */
  addLink: AddLink;
  /**
   * The children to render.
   */
  children: React.ReactNode;
};

/**
 * Provider for the `Link` component.
 *
 * @private Not meant to be used by end users. Will be automatically added by the renderer.
 */
export const LinkProvider: React.FC<LinkProviderProps> = ({
  addLink,
  children,
}) => <LinkContext.Provider value={addLink}>{children}</LinkContext.Provider>;

/**
 * Hook to add a link to the list of links that the renderer will follow.
 *
 * @private Not meant to be used by end users. Will be automatically added by the renderer.
 */
export const useAddLink = () => {
  const addLink = React.useContext(LinkContext);

  if (!addLink) {
    throw new Error("`useAddLink` must be used within a `<LinkProvider>`");
  }

  return addLink;
};
