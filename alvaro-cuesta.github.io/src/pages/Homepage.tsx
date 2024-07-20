import React from "react";
import { Link } from "../ui/Link";
import { Icon } from "../ui/Icon";
import { Template } from "../Template";

type ProjectProps = {
  name: string;
  codeLink: string;
  liveLink?: string;
  children: React.ReactNode;
};

const Project: React.FC<ProjectProps> = ({
  name,
  codeLink,
  liveLink,
  children,
}) => {
  const nameElement = <strong>{name}</strong>;

  return (
    <li>
      {liveLink ? <Link href={liveLink}>{nameElement}</Link> : nameElement} (
      <Link href={codeLink}>code</Link>) — {children}
    </li>
  );
};

export const Homepage: React.FC = () => {
  return (
    <Template>
      <section>
        <h2>Full-stack software engineer</h2>
        <p>
          Hello! I am Álvaro Cuesta, a{" "}
          <strong>full-stack software engineer</strong> based in Madrid, Spain.
        </p>
        <p>
          I have a very unique background as a developer: I started my career as
          a systems engineer, so I have a very deep understanding of low-level
          topics like operating systems, networking, and hardware.
        </p>
        <p>
          That does not mean I am not a great web developer! I switched my focus
          to web development out of pure love for the web platform, and I have
          been working with it for the past ~15 years, learning a ton of
          technologies in the process.
        </p>
        <p>
          Be it HTML, CSS, or modern JavaScript frameworks like React, I have
          been there and done that.
        </p>

        <article>
          This page is <strong>currently under construction</strong> 🚧 with my
          own static site generator,{" "}
          <Link href="https://github.com/alvaro-cuesta/alvaro-cuesta.github.io/tree/master/xenon-ssg">
            Xenon SSG
          </Link>
          . Please be patient while I finish it!
        </article>
      </section>

      <section>
        <h2>About me</h2>
        <div className="grid">
          <article>
            <header id="technologies">
              <h3>
                I <span aria-label="love">❤️</span> these technologies
              </h3>
            </header>
            <ul>
              <li>
                <Link href="https://nodejs.org">Node.js</Link> +{" "}
                <Link href="https://www.typescriptlang.org">TypeScript</Link> +{" "}
                <Link href="https://reactjs.org">React</Link>
              </li>
              <li>
                <Link href="https://www.rust-lang.org">Rust</Link> +{" "}
                <Link href="https://tauri.studio">Tauri</Link>
              </li>
            </ul>
          </article>
          <article>
            <header id="knowledge">
              <h3>I have knowledge in...</h3>
            </header>
            <ul>
              <li>Computer graphics and procedural generation</li>
              <li>Cryptography & blockchain tech</li>
              <li>Electronics engineering</li>
            </ul>
          </article>
        </div>
      </section>

      <section id="projects">
        <h2>My projects</h2>
        <p>
          You can visit my{" "}
          <Link href="https://github.com/alvaro-cuesta">
            <Icon collection="fab" name="github" aria-hidden /> GitHub profile
          </Link>{" "}
          to take a peek at all my public open-source projects, but here are
          some of my favorites:
        </p>
        <ul>
          <Project
            name="Xenon SSG"
            codeLink="https://github.com/alvaro-cuesta/alvaro-cuesta.github.io/tree/master/xenon-ssg"
          >
            A React static site generator written in TypeScript. It powers this
            very website!
          </Project>

          <Project
            name="Instant Trivia"
            codeLink="https://github.com/alvaro-cuesta/instant-trivia"
            liveLink="https://trivia.kaod.me"
          >
            A fast trivia game.
          </Project>

          <Project
            name="XRderToy Viewer"
            codeLink="https://github.com/alvaro-cuesta/xrdertoy"
            liveLink="https://xrdertoy.surge.sh"
          >
            View <Link href="https://www.shadertoy.com/">ShaderToy</Link>{" "}
            effects in Virtual Reality.
          </Project>

          <Project
            name="Lambda Musika"
            codeLink="https://github.com/alvaro-cuesta/lambda-musika"
            liveLink="https://lambda.kaod.me"
          >
            A live-coding environment for procedural music generation.
          </Project>

          <Project
            name="Rustopals"
            codeLink="https://github.com/alvaro-cuesta/rustopals"
          >
            A Rust implementation of the{" "}
            <Link href="https://cryptopals.com/">
              Cryptopals Crypto Challenges
            </Link>
            .
          </Project>

          <Project
            name="Protohackers"
            codeLink="https://github.com/alvaro-cuesta/protohackers"
          >
            My Rust solutions for{" "}
            <Link href="https://protohackers.com/">Protohackers</Link> server
            programming challenges.
          </Project>

          <li>
            ...plus tons of contributions to other open-source projects! 🎉
          </li>
        </ul>
      </section>
    </Template>
  );
};
