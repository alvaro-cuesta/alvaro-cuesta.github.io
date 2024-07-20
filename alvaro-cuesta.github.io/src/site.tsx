import React from "react";
import { Homepage } from "./pages/Homepage";
import { NotFound } from "./pages/NotFound";

export const renderSite = (pathname: string) => {
  if (pathname === "/") {
    return <Homepage />;
  }

  if (pathname === "/404.html") {
    return <NotFound />;
  }

  throw new Error(`Path not found: ${pathname}`);
};
