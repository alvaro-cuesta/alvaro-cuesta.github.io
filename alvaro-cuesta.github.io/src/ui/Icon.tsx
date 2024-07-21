import cx from "classnames";

type IconProps = {
  collection:
    | "fa" // ??
    | "fas" // fa-solid
    | "fab"; // fa-brands
  name: string;
  className?: string;
} & (
  | {
      "aria-hidden": "true" | true;
    }
  | {
      "aria-hidden"?: "false" | false | never;
      title: string;
    }
  | {
      "aria-hidden"?: "false" | false | never;
      "aria-label": string;
    }
);

export const Icon: React.FC<IconProps> = ({
  collection,
  name,
  className,
  ...restProps
}) => (
  <span className={cx(className, collection, `fa-${name}`)} {...restProps} />
);
