
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Instructions

## Project

This is an Arabic RTL educational website for fourth-grade students.

## Technology

- Next.js 16
- React
- TypeScript
- Supabase
- Tailwind CSS
- pnpm
- GitHub Pages deployment

## General Rules

- Read and understand the existing code before making changes.
- Modify only the files necessary for the requested task.
- Do not rewrite entire files when a small change is sufficient.
- Do not refactor unrelated code.
- Preserve existing functionality unless explicitly asked to change it.
- Preserve Arabic language support and RTL layout.
- Do not change the visual design unless explicitly requested.
- Do not introduce new dependencies unless necessary.
- Prefer existing components and utilities over creating duplicates.

## Supabase

- Do not modify the database schema unless explicitly requested.
- Do not delete tables, columns, records, migrations, or storage objects without explicit confirmation.
- Inspect the existing Supabase implementation before creating new queries or tables.
- Never expose secret keys in client-side code.

## Admin

- Preserve the existing admin authentication system.
- Do not change ADMIN_PASSWORD or ADMIN_SESSION_SECRET handling unless explicitly requested.
- Keep admin routes and server actions protected.

## Educational Content

- Preserve Arabic educational content exactly unless the user asks for corrections.
- Do not remove existing lesson images or resources.
- Preserve the existing subject and lesson structure.

## Styling

- Keep the existing Arabic RTL design.
- Preserve the project's existing color palette.
- Avoid unnecessary visual changes.
- Keep the layout responsive.
- Reuse existing components whenever possible.

## Development

- Use pnpm rather than npm when possible.
- Inspect the relevant files before modifying them.
- Follow the Next.js instructions above and consult the relevant Next.js documentation when necessary.
- After significant changes, run the appropriate checks.
- Prefer targeted checks over unnecessarily running the entire project.

## Git

- Never run `git push` automatically.
- Never force push.
- Never delete or rewrite Git history.
- Check `git status` before major changes.
- Do not create commits unless explicitly requested.
- After making changes, report which files were modified.

## Important

- Keep changes minimal, focused, and reversible.
- Do not make unrelated improvements.
- When a request is ambiguous, inspect the existing implementation before guessing.
- Do not change database structure, deployment configuration, or authentication unless requested.