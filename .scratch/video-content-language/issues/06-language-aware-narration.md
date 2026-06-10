# Language-aware narration and voice compatibility

Status: ready-for-agent

## Parent

`.scratch/video-content-language/PRD.md`

## What to build

Make narration generation and video translation respect Current content
language and explicit voice-language compatibility.

Narration drafting uses the same content language as the video. Translating a
narrated video translates the narration script and regenerates narration audio.
The selected voice is retained only when declared compatible with the Target
content language. Otherwise Studio requires an explicit compatible voice choice.
Background music remains unchanged.

## Acceptance criteria

- [ ] Narration drafting receives the project's Current content language.
- [ ] Initial narration generated after video creation matches visible frame language.
- [ ] Multi-frame translation translates narration consistently with the translated Content Graph.
- [ ] Narration audio is regenerated after successful script translation.
- [ ] Voice definitions declare supported content languages.
- [ ] A compatible selected voice is retained.
- [ ] An incompatible selected voice blocks narration regeneration with a clear selection prompt.
- [ ] The system never silently substitutes another voice.
- [ ] Background music asset, prompt, volume, and fades are preserved.
- [ ] Translation failure preserves the old narration text and audio.
- [ ] Tests cover compatible voice retention, incompatible voice rejection, audio replacement, rollback, and music preservation.

## Blocked by

- `.scratch/video-content-language/issues/01-explicit-language-first-generation.md`
- `.scratch/video-content-language/issues/04-atomic-multiframe-translation.md`

## Comments

