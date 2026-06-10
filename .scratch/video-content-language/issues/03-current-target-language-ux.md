# Current versus Target content language UX

Status: ready-for-agent

## Parent

`.scratch/video-content-language/PRD.md`

## What to build

Make pending language changes understandable and non-destructive for projects
that already have generated content.

The toolbar selector updates the language choice and Target content language,
but existing frames retain their Current content language. Studio displays both
states when they differ and offers Apply on content regeneration and Translate
current video actions. Restyle and retime preserve current wording. The selector
is disabled while generation or translation is running.

## Acceptance criteria

- [ ] Changing the selector on an existing project does not mutate graph, frames, narration, audio, or Current content language.
- [ ] Studio displays Current and Target content languages when they differ.
- [ ] Studio offers Apply on content regeneration and Translate current video actions for a mismatch.
- [ ] Content regeneration applies the Target content language.
- [ ] Restyle preserves Current content language and exact wording.
- [ ] Retime preserves Current content language and exact wording.
- [ ] The selector is disabled while generation or translation is running.
- [ ] A tooltip or equivalent explanation states why the selector is disabled.
- [ ] The Current-language badge changes only after a successful content-producing operation.
- [ ] Reloading Studio preserves pending Current/Target mismatch state.
- [ ] API and UI behavior tests cover non-destructive selection, mismatch display, and operation locking.

## Blocked by

- `.scratch/video-content-language/issues/01-explicit-language-first-generation.md`

## Comments

