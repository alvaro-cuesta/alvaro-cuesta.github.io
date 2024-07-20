import React, { type ReactNode } from "react";
import { Template } from "../Template";
import { PluginInjectableTag } from "xenon-ssg-express/src/plugins/plugins";

type NotFoundProps = {
  injectable?: ReactNode[];
};

export const NotFound: React.FC<NotFoundProps> = (props) => {
  return (
    <Template title="Not found" injectable={props.injectable}>
      <main className="container">
        <h2>Not found</h2>
        <p>The page you are looking for does not exist.</p>
      </main>
    </Template>
  );
};
