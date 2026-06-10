# Video Content Language Handoff

Date: 2026-06-10

## Goal

Continue implementing the video content language feature with TDD. The Studio
locale remains independent from the language used inside generated videos.

Use WSL/Linux for every build, test, and run command.

## Product References

- PRD: `.scratch/video-content-language/PRD.md`
- Issues: `.scratch/video-content-language/issues/01-*.md` through `08-*.md`
- Detailed design: `docs/design/video-content-language.md`
- ADR: `docs/adr/0001-separate-video-content-language-from-studio-locale.md`
- Architecture: `docs/architecture.md`
- Domain glossary: `CONTEXT.md`

## Implemented

- Core language types and project preference fields:
  - `language`: `auto | vi | en | zh-CN`
  - `targetLanguage`: resolved concrete language
  - `contentLanguage`: language of current generated artifacts
- Automatic language policy:
  - preserve supported first-source language
  - unsupported/unidentifiable source falls back to Vietnamese
  - without a source, use the opening request language
  - otherwise default to English
- Shared generation prompt contract via `contentLanguageInstruction()`.
- Project methods for selecting a target and committing successful generation.
- Language contract wired into single-frame and split multi-frame generation.
- Studio backend endpoint: `PUT /api/projects/:id/content-language`.
- Studio toolbar language selector and current/target status.
- Atomic core replacement for translated single-frame or multi-frame artifacts.
- Core tests cover policy, persistence, generation commit, atomic replacement,
  and rollback validation.

## In Progress

The toolbar renders a Translate button when current and target languages differ,
but its click handler and backend translation route are not implemented yet.

Translation work should continue by:

1. Add an SSE translation endpoint using the project's selected agent/model.
2. Multi-frame: translate the content graph once, regenerate every frame in
   memory, then call `replaceGeneratedContentAtomic()`.
3. Single-frame: regenerate one complete HTML document while preserving visual
   structure and animation, then call the same atomic method.
4. Translate/regenerate narration and validate voice compatibility; keep music.
5. Add template font metadata/fallback handling and advisory language checks.
6. Update issue statuses after acceptance tests pass.

## Verification Completed

Run under WSL with Node 22 and pnpm 9:

```bash
pnpm --filter @html-video/core test
pnpm --filter @html-video/cli test
node --check packages/project-studio/public/app.js
node --check packages/project-studio/public/i18n.js
```

At pause time:

- Core: 10 tests passing.
- CLI: 14 tests passing.
- CLI TypeScript build passing.
- Studio JavaScript syntax checks passing.

## Environment

On the previous Windows machine, WSL used:

```bash
. /home/pat/.nvm/nvm.sh
cd /mnt/d/Workspace/html-video
```

The Linux machine should install Node 22, enable Corepack, and use pnpm 9.

## Recommended Skills

- `tdd`
- `diagnose` if translation rollback or Studio streaming fails
- `grill-with-docs` only if product behavior needs to be reconsidered

Do not push to the upstream `nexu-io/html-video` remote without explicit
approval. Continue development against `patdev495/html-video-fork`.
