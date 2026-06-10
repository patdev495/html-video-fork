# Explicit content language from toolbar to first generation

Status: ready-for-agent

## Parent

`.scratch/video-content-language/PRD.md`

## What to build

Deliver the first complete Video content language path from a project-level
Studio toolbar selector through persistence and agent generation.

Users can select Automatic, Vietnamese, English, or Simplified Chinese. The
project maintains separate language choice, Target content language, and Current
content language states. Explicit Vietnamese, English, and Simplified Chinese
choices must drive Content Graph planning, every per-frame generation call,
single-frame generation, and narration drafting. After successful initial
generation, Current content language becomes the Target content language.

Older projects without language fields continue to load as Automatic. The
Studio locale must not participate in this behavior.

## Acceptance criteria

- [ ] Studio shows a persistent project-level content-language selector with Automatic, Vietnamese, English, and Simplified Chinese.
- [ ] Changing the selector persists immediately and survives Studio reload.
- [ ] Project state distinguishes the selector choice, Target content language, and Current content language.
- [ ] Existing projects without language state load successfully with Automatic defaults.
- [ ] Explicit Vietnamese selection causes the first single-frame and multi-frame generation to produce Vietnamese user-visible content.
- [ ] Explicit English selection causes graph, frame, and narration prompts to require English.
- [ ] Explicit Simplified Chinese selection causes graph, frame, and narration prompts to require Simplified Chinese.
- [ ] Per-frame prompts repeat the concrete language contract independently.
- [ ] Generation preserves names, URLs, code identifiers, versions, numeric values, and units.
- [ ] Current content language is updated only after successful generation.
- [ ] Studio locale changes do not modify any project content-language state.
- [ ] External-behavior tests cover persistence, backward compatibility, prompt contracts, and successful Current-language updates.

## Blocked by

None - can start immediately.

## Comments

