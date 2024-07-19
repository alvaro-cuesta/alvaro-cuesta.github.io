import React from "react";
import { Template } from "./Template";

export const NotFound: React.FC = () => {
  return (
    <Template title="Not found">
      <main className="container">
        <h2>Not found</h2>
        <p>The page you are looking for does not exist.</p>
      </main>
    </Template>
  );
};
