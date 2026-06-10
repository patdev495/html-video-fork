# Automatic language resolution from source or opening request

Status: ready-for-agent

## Parent

`.scratch/video-content-language/PRD.md`

## What to build

Complete Automatic content language resolution as a deterministic, testable
policy used by project language operations and generation.

When source material exists, the first source supplied by the user is the
primary source. Vietnamese, English, Simplified Chinese, and Traditional Chinese
are preserved. Other or unidentifiable source languages resolve to Vietnamese.
Without source material, use the user's opening request and fall back to English
when it cannot be classified.

Studio displays the concrete resolved target and enough context to explain
unsupported-source translation. Resolution never reads the Studio locale.

## Acceptance criteria

- [ ] Automatic resolves Vietnamese source material to Vietnamese.
- [ ] Automatic resolves English source material to English.
- [ ] Automatic resolves Simplified Chinese source material to Simplified Chinese.
- [ ] Automatic resolves Traditional Chinese source material to Traditional Chinese.
- [ ] Automatic resolves Japanese, French, and other unsupported source languages to Vietnamese.
- [ ] Automatic resolves unidentifiable source material to Vietnamese.
- [ ] With multiple sources, the first user-supplied source determines the target.
- [ ] Without source material, the opening request determines the target language.
- [ ] An unidentifiable opening request resolves to English.
- [ ] Later style words or messages do not change the language inferred from the opening request.
- [ ] Studio displays labels such as Automatic (English), Automatic (Traditional Chinese), or Automatic (Vietnamese, translated from Japanese).
- [ ] The resolved target is frozen for an in-progress generation.
- [ ] Studio locale is never consulted.
- [ ] Table-driven tests cover every resolution branch and first-source precedence.

## Blocked by

- `.scratch/video-content-language/issues/01-explicit-language-first-generation.md`

## Comments

