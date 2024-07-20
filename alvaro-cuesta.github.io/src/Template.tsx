import React from "react";
import { Link } from "./Link";
import { PICO_FILE } from "../config";
import { Icon } from "./Icon";

type TemplateProps = {
  title?: string;
  children: React.ReactNode;
};

export const Template: React.FC<TemplateProps> = ({ title, children }) => {
  const fullTitle = title ? `${title} | Álvaro Cuesta` : "Álvaro Cuesta";
  const year = new Date().getFullYear();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{fullTitle}</title>
        <meta name="darkreader-lock" />
        <link rel="stylesheet" href={`/css/pico/${PICO_FILE}`} />
        <link rel="stylesheet" href="/css/fontawesome/css/all.min.css" />
        <link rel="stylesheet" href="/css/index.min.css" />
      </head>
      <body>
        <header className="container">
          <nav>
            <ul>
              <li>
                <h1>
                  <Link href="/">Álvaro Cuesta</Link>
                </h1>
              </li>
            </ul>
            <ul>
              <li>
                <Link href="/#technologies">Tech</Link>
              </li>
              <li>
                <Link href="/#knowledge">Knowledge</Link>
              </li>
              <li>
                <Link href="/#projects">Projects</Link>
              </li>
            </ul>
          </nav>
        </header>
        {children}
        <footer className="container">
          <nav>
            <ul>
              <li>
                © {year} <Link href="/">Álvaro Cuesta</Link>
              </li>
            </ul>
            <ul>
              <li>
                <Link
                  href="https://github.com/alvaro-cuesta/"
                  aria-label="Álvaro Cuesta's GitHub (opens in new tab)"
                >
                  <Icon collection="fab" name="github" aria-hidden /> GitHub
                </Link>
              </li>
            </ul>
          </nav>
        </footer>
      </body>
    </html>
  );
};
