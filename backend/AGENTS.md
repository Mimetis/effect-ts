<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Effect

This backend uses Effect 4 (`effect` 4.0.0). Before writing, reviewing or migrating backend code with Effect, read the `effect` skill, `.github/skills/effect/SKILL.md` at the repository root (`../.github/skills/effect/SKILL.md` from here), then the reference file for the topic. Do not rely on memory: most Effect 3 and v4 beta APIs (`Context.Tag`, `Effect.catchAll`, `Schema.TaggedErrorClass`, `effect/unstable/http`…) do not exist in 4.0.0.
