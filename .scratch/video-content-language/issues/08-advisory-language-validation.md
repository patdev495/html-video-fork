# Advisory generated-language validation

Status: ready-for-agent

## Parent

`.scratch/video-content-language/PRD.md`

## What to build

Add advisory checks that compare generated Content Graph and visible frame text
with the Target content language.

Validation detects obvious language mismatch and missing-glyph indicators while
ignoring legitimate technical tokens such as brand names, URLs, code,
identifiers, numbers, versions, and units. Warnings are shown in Studio with a
retry path but never hard-block export.

## Acceptance criteria

- [ ] Vietnamese validation warns when most natural-language content remains English or Chinese.
- [ ] English validation warns when most natural-language content remains Vietnamese or Chinese.
- [ ] Simplified and Traditional Chinese validation warns when expected Han-character coverage is absent.
- [ ] Brand names, URLs, code identifiers, versions, numeric values, and units are excluded from mismatch scoring.
- [ ] Replacement characters and obvious missing-glyph indicators produce warnings.
- [ ] Validation covers both Content Graph text and user-visible HTML text.
- [ ] Warnings identify the affected graph or frame scope.
- [ ] Studio offers retry or continue actions.
- [ ] Export remains available after an advisory warning.
- [ ] Tests cover Vietnamese, English, Simplified Chinese, Traditional Chinese, unsupported-source translation, and mixed technical content.

## Blocked by

- `.scratch/video-content-language/issues/01-explicit-language-first-generation.md`
- `.scratch/video-content-language/issues/02-automatic-language-resolution.md`

## Comments

