import Image, { type StaticImageData } from "next/image";
import {
  Activity,
  Archive,
  Boxes,
  Braces,
  GitBranch,
  Grid2X2,
  Network,
  Repeat2,
  Server,
  Shapes,
  ShieldCheck,
  TestTube2,
  type LucideIcon,
} from "lucide-react";
import jenkins from "devicon/icons/jenkins/jenkins-original.svg";
import actions from "devicon/icons/githubactions/githubactions-original.svg";
import nginx from "devicon/icons/nginx/nginx-original.svg";
import git from "devicon/icons/git/git-original.svg";
import flutter from "devicon/icons/flutter/flutter-original.svg";
import dart from "devicon/icons/dart/dart-original.svg";
import javascript from "devicon/icons/javascript/javascript-original.svg";
import typescript from "devicon/icons/typescript/typescript-original.svg";
import react from "devicon/icons/react/react-original.svg";
import next from "devicon/icons/nextjs/nextjs-original.svg";
import tailwind from "devicon/icons/tailwindcss/tailwindcss-original.svg";
import node from "devicon/icons/nodejs/nodejs-original.svg";
import express from "devicon/icons/express/express-original.svg";
import postgres from "devicon/icons/postgresql/postgresql-original.svg";
import python from "devicon/icons/python/python-original.svg";
import clang from "devicon/icons/c/c-original.svg";
import cpp from "devicon/icons/cplusplus/cplusplus-original.svg";
import java from "devicon/icons/java/java-original.svg";
import github from "devicon/icons/github/github-original.svg";
import docker from "devicon/icons/docker/docker-original.svg";
import kubernetes from "devicon/icons/kubernetes/kubernetes-original.svg";
import mysql from "devicon/icons/mysql/mysql-original.svg";
import django from "devicon/icons/django/django-plain.svg";
import fastapi from "devicon/icons/fastapi/fastapi-original.svg";
import flask from "devicon/icons/flask/flask-original.svg";
import swift from "devicon/icons/swift/swift-original.svg";
import html from "devicon/icons/html5/html5-original.svg";
import css from "devicon/icons/css3/css3-original.svg";
import cmake from "devicon/icons/cmake/cmake-original.svg";
import latex from "devicon/icons/latex/latex-original.svg";
import opengl from "devicon/icons/opengl/opengl-original.svg";
import type { pillars } from "@/content/profile";
import { profileListedTools } from "@/content/github-stack";

type ToolName = (typeof pillars)[number]["tools"][number];
type Mark = { kind: string } & (
  | { logo: StaticImageData | string; icon?: never }
  | { icon: LucideIcon; logo?: never }
);
const marks: Record<ToolName, Mark> = {
  Jenkins: { logo: jenkins, kind: "CI/CD" },
  "GitHub Actions": { logo: actions, kind: "Automation" },
  NGINX: { logo: nginx, kind: "Web server" },
  VPS: { icon: Server, kind: "Infrastructure" },
  Git: { logo: git, kind: "Version control" },
  GitHub: { logo: github, kind: "Code collaboration" },
  Docker: { logo: docker, kind: "Containers" },
  Kubernetes: { logo: kubernetes, kind: "Orchestration" },
  Observability: { icon: Activity, kind: "Logs & metrics" },
  Backups: { icon: Archive, kind: "Operations practice" },
  "Security hardening": { icon: ShieldCheck, kind: "Operations practice" },
  "Release automation": { icon: GitBranch, kind: "Delivery practice" },
  Flame: { logo: "/media/technologies/flame.webp", kind: "Game engine" },
  Pygame: { logo: "/media/technologies/pygame.webp", kind: "Game library" },
  "C++": { logo: cpp, kind: "Language" },
  "graphics.h": { icon: Shapes, kind: "Graphics library" },
  Tiled: { icon: Grid2X2, kind: "Level editor" },
  OpenGL: { logo: opengl, kind: "Graphics API" },
  GLSL: { icon: Braces, kind: "Shader language" },
  "Custom C++ engine": { icon: Boxes, kind: "Graphics engineering" },
  "Game loops": { icon: Repeat2, kind: "Runtime design" },
  Flutter: { logo: flutter, kind: "UI framework" },
  Dart: { logo: dart, kind: "Language" },
  JavaScript: { logo: javascript, kind: "Language" },
  TypeScript: { logo: typescript, kind: "Language" },
  React: { logo: react, kind: "UI library" },
  "Next.js": { logo: next, kind: "Web framework" },
  "Tailwind CSS": { logo: tailwind, kind: "Styling" },
  "Node.js": { logo: node, kind: "Runtime" },
  Express: { logo: express, kind: "API framework" },
  PostgreSQL: { logo: postgres, kind: "Database" },
  MySQL: { logo: mysql, kind: "Database" },
  Django: { logo: django, kind: "Web framework" },
  FastAPI: { logo: fastapi, kind: "API framework" },
  Flask: { logo: flask, kind: "Web framework" },
  HTML5: { logo: html, kind: "Markup" },
  CSS3: { logo: css, kind: "Stylesheets" },
  "REST APIs": { icon: Network, kind: "API design" },
  Python: { logo: python, kind: "Language" },
  C: { logo: clang, kind: "Language" },
  Java: { logo: java, kind: "Language / exploring" },
  Swift: { logo: swift, kind: "Language" },
  CMake: { logo: cmake, kind: "Build system" },
  TeX: { logo: latex, kind: "Typesetting / LaTeX" },
  UML: { icon: GitBranch, kind: "System modelling" },
  "Design patterns": { icon: Boxes, kind: "Software design" },
  Testing: { icon: TestTube2, kind: "Engineering practice" },
  "Unit testing": { icon: TestTube2, kind: "Engineering practice" },
  "Integration testing": { icon: Network, kind: "Engineering practice" },
  "Smoke testing": { icon: ShieldCheck, kind: "Engineering practice" },
};

export function TechnologyMark({ name }: { name: ToolName }) {
  const mark = marks[name];
  const Icon = mark.icon;
  return (
    <li className="technology-mark" data-technology={name}>
      <span
        className={`technology-icon ${name === "Pygame" ? "wordmark" : ""}`}
      >
        {mark.logo ? (
          <Image
            src={mark.logo}
            alt={`${name} logo`}
            width={40}
            height={40}
            className="technology-logo"
          />
        ) : Icon ? (
          <Icon size={28} aria-hidden="true" />
        ) : null}
      </span>
      <span className="technology-name">{name}</span>
      <span className="technology-kind">{mark.kind}</span>
      {profileListedTools.includes(name) && (
        <span className="technology-source">Profile-listed</span>
      )}
    </li>
  );
}
