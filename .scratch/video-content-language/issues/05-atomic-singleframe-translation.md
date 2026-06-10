# Atomic single-frame video translation

Status: ready-for-agent

## Parent

`.scratch/video-content-language/PRD.md`

## What to build

Add the Translate current video workflow for single-frame projects.

Use the project's selected agent and model to regenerate the complete HTML in
the Target content language. Preserve layout, palette, typography hierarchy,
animation, names, numbers, and stable text identifiers. Do not translate by raw
string replacement.

Stage the translated HTML and commit it only after validation succeeds. Failure
must leave the existing preview and Current content language unchanged.

## Acceptance criteria

- [ ] Translation uses the project's selected agent and model.
- [ ] The agent receives the current complete HTML and an explicit Target content language contract.
- [ ] User-visible wording is translated while names, numbers, URLs, versions, code identifiers, and units are preserved.
- [ ] Layout, palette, typography hierarchy, and animation behavior remain recognizably equivalent.
- [ ] Stable `data-hv-text` keys are preserved.
- [ ] Studio warns when the original HTML lacks reliable `data-hv-text` coverage.
- [ ] Raw string replacement is not used as the translation mechanism.
- [ ] Successful translation atomically replaces the preview and updates Current content language.
- [ ] Failed generation or validation leaves the previous HTML and Current content language unchanged.
- [ ] Streamed progress is visible in Studio.
- [ ] Integration tests cover success, missing text identifiers, and rollback.

## Blocked by

- `.scratch/video-content-language/issues/01-explicit-language-first-generation.md`
- `.scratch/video-content-language/issues/03-current-target-language-ux.md`

## Comments

