[< Back](../README.md)

# Project Structure

The project structure is as follows:

```
.
├── client/: client source code
│   ├── public/: static files
│   ├── src/: source code
│   ├── .gitignore: git ignore
│   ├── .components.json: UI component configuration
│   ├── next.config.ts: Next.js configuration
│   ├── package.json: dependencies for the project
│   ├── postcss.config.mjs: PostCSS configuration
│   └── tsconfig.json: TypeScript configuration
│
├── docs/: documentations
│   ├── structure.md: structure of the project
│   └── workflow.md: workflow of the project
│
├── server/: server source code
│   ├── public/: static files
│   ├── src/: source code
│   ├── .env: environment variables
│   ├── .env.example: example environment variables
│   ├── package.json: dependencies for the project
│   ├── tsconfig.json: TypeScript configuration
│   └── vite.config.ts: Vite configuration
│
├── .gitattributes: git attributes
├── .gitignore: git ignore
├── .npmrc: npm configuration
├── biome.json: linter/formatter configuration
├── CONTRIBUTING.md: contributing document
├── justfile: commands for the project
├── package.json: dependencies for the monorepo
├── pnpm-lock.yaml: lock file for pnpm
├── pnpm-workspace.yaml: workspace configuration for pnpm
├── README.md: project description
└── tsconfig.base.json: base configuration for TypeScript
```
