# Atomic multi-frame video translation

Status: ready-for-agent

## Parent

`.scratch/video-content-language/PRD.md`

## What to build

Add an end-to-end Translate current video workflow for multi-frame projects,
using the project's selected agent and model.

Translate the entire Content Graph in one agent call, preserving graph identity,
ordering, frame durations, and numeric data. Then regenerate every frame in the
Target content language while preserving the selected template, visual style,
and animation approach. Stream progress to Studio.

The workflow must stage new graph and frames and commit them only after the
complete operation succeeds. Failure leaves the original video untouched.

## Acceptance criteria

- [ ] Translate current video uses the agent and model selected by the project.
- [ ] The complete Content Graph is translated in one agent call.
- [ ] Schema version, node IDs, node kinds, edges, ordering, and frame durations remain unchanged.
- [ ] Numeric data values, versions, URLs, code identifiers, names, and units are preserved.
- [ ] Synopsis, visible node wording, labels, CTA, and string labels inside structured data are translated.
- [ ] Every regenerated frame receives the Target content language and existing visual/template constraints.
- [ ] Frame style and animation approach remain consistent with the pre-translation video.
- [ ] Studio receives streamed translation and frame-regeneration progress.
- [ ] Successful translation atomically replaces graph and frames and updates Current content language.
- [ ] Failed graph translation or frame regeneration preserves the old graph, frames, narration, audio, and Current content language.
- [ ] Existing exports and background music are not deleted.
- [ ] Integration tests cover successful commit, graph preservation, mid-run failure, and rollback.

## Blocked by

- `.scratch/video-content-language/issues/01-explicit-language-first-generation.md`
- `.scratch/video-content-language/issues/03-current-target-language-ux.md`

## Comments

