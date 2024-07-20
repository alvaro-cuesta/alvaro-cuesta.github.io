import React, { type ReactNode } from "react";
import { Template } from "../Template";

type NotFoundProps = {
  origin: string;
  basepath: string;
  pathname: string;
  injectable?: ReactNode[];
};

export const NotFound: React.FC<NotFoundProps> = (props) => {
  return (
    <Template
      origin={props.origin}
      basepath={props.basepath}
      pathname={props.pathname}
      title="Not found"
      injectable={props.injectable}
    >
      <main className="container">
        <h2>Not found</h2>
        <p>The page you are looking for does not exist.</p>
      </main>
    </Template>
  );
};
