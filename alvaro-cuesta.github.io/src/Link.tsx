import React, { ComponentPropsWithoutRef } from "react";
import { Link as XenonLink } from "xenon-ssg/src/generate/Link";
import { canonicalizeHref } from "xenon-ssg/src/url";

type LinkProps = ComponentPropsWithoutRef<"a"> & { isExternal?: boolean };

export const Link: React.FC<LinkProps> = ({
  isExternal,
  children,
  ...props
}) => {
  const calculatedIsExternal =
    isExternal ??
    (props.href ? !canonicalizeHref(props.href).isInternal : false);

  return (
    <XenonLink
      {...props}
      target={props.target ?? calculatedIsExternal ? "_blank" : undefined}
      rel={calculatedIsExternal ? "noopener noreferrer" : undefined}
    >
      {children}
      {calculatedIsExternal ? (
        <span
          className="fas fa-external-link-alt small-sup"
          aria-hidden="true"
        />
      ) : null}
    </XenonLink>
  );
};
