import React, { ReactNode } from "react";
import { Link } from "./ui/Link";
import { Icon } from "./ui/Icon";

type TemplateProps = {
  title?: string;
  injectable?: ReactNode[];
  children: React.ReactNode;
};

export const Template: React.FC<TemplateProps> = ({
  title,
  injectable,
  children,
}) => {
  const fullTitle = title ? `${title} | Álvaro Cuesta` : "Álvaro Cuesta";
  const year = new Date().getFullYear();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{fullTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="darkreader-lock" />
        {injectable}
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
        <main className="container">{children}</main>
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
