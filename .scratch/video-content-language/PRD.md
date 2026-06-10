# Video Content Language in Studio

Status: ready-for-agent

## Problem Statement

Studio currently lets users generate videos from chat, uploaded material, and
article links, but it does not provide an explicit way to control the language
of the generated video. The agent may follow the source language, the user's
chat language, or a mixture of both. This makes output unpredictable when, for
example, a user wants a Vietnamese video based on an English article.

The language of Studio controls is a separate concern and must not influence the
language of video wording or narration. Users also need to change the desired
language without silently mutating an already-generated video.

## Solution

Add a persistent Video content language control to the Studio toolbar. It
supports Automatic, Vietnamese, English, and Simplified Chinese. Automatic
preserves Vietnamese, English, Simplified Chinese, and Traditional Chinese
source material; unsupported or unidentifiable source languages resolve to
Vietnamese. When there is no source material, Automatic follows the user's
opening request and falls back to English when that request cannot be classified.

Each project distinguishes:

- the Video content language choice selected by the user
- the Target content language for the next content-producing operation
- the Current content language of the generated video

Initial generation and content regeneration produce content directly in the
Target content language. Changing the toolbar choice does not rewrite existing
frames. Users may explicitly translate the current video using the same agent
and model already selected by the project.

Translation keeps structure, facts, numbers, visual style, animation, and timing
while regenerating visible wording and narration. Failed translation preserves
the complete previous video state.

## User Stories

1. As a Studio user, I want to select the language of video content independently of the Studio interface language, so that UI localization does not affect my output.
2. As a Studio user, I want the language selector to be visible in the toolbar, so that I can understand and change the project setting at any time.
3. As a Studio user, I want my language selection saved immediately, so that reloading Studio does not lose it.
4. As a Studio user, I want each project to remember its own language choice, so that projects can target different audiences.
5. As a Studio user, I want to choose Automatic, Vietnamese, English, or Simplified Chinese, so that the common output languages are predictable.
6. As a user generating from a Vietnamese article, I want Automatic mode to produce Vietnamese content, so that no unnecessary translation occurs.
7. As a user generating from an English article, I want Automatic mode to produce English content, so that the source language is preserved.
8. As a user generating from a Simplified Chinese article, I want Automatic mode to preserve Simplified Chinese, so that the output matches the source.
9. As a user generating from a Traditional Chinese article, I want Automatic mode to preserve Traditional Chinese, so that the script is not silently converted.
10. As a user generating from a Japanese, French, or other unsupported-language article, I want Automatic mode to produce Vietnamese, so that there is a deterministic fallback.
11. As a user generating from source material whose language cannot be detected, I want Automatic mode to produce Vietnamese, so that generation is not blocked.
12. As a user without source material, I want Automatic mode to follow the language of my opening request, so that later style words do not change the output language.
13. As a user whose opening request language cannot be detected, I want Automatic mode to fall back to English, so that generation remains possible.
14. As a user with multiple sources, I want Automatic mode to use the first source I supplied as the primary language source, so that resolution is stable and understandable.
15. As a user, I want Studio to show the concrete language resolved by Automatic mode, so that I know what language will be generated.
16. As a user supplying an English article and selecting Vietnamese before generation, I want the first video to be generated directly in Vietnamese, so that I do not need a separate translation step.
17. As a user selecting English before generation, I want the Content Graph, visible frame text, labels, CTA, and narration to be English, so that the complete output is consistent.
18. As a user selecting Vietnamese before generation, I want source facts translated by meaning while preserving names, numbers, versions, URLs, code identifiers, and units, so that the video remains accurate.
19. As a user selecting Chinese before generation, I want all user-visible generated wording to use Simplified Chinese, so that explicit selection is deterministic.
20. As a user, I want each independently generated frame to receive the same language requirement, so that a multi-frame video does not mix languages.
21. As a user, I want single-frame generation to follow the same language rules as multi-frame generation, so that behavior is consistent across video types.
22. As a user, I want content regeneration to apply the current Target content language, so that rewritten content matches my latest choice.
23. As a user, I want restyling to preserve the Current content language and wording, so that changing visuals does not unexpectedly translate content.
24. As a user, I want retiming to preserve the Current content language and wording, so that changing pace does not rewrite content.
25. As a user with an existing video, I want changing the toolbar language choice to leave the current frames untouched, so that a simple setting change is non-destructive.
26. As a user with an existing video, I want Studio to distinguish Current content language from Target content language, so that the UI does not claim the old video has already changed.
27. As a user whose Current and Target languages differ, I want an action to apply the target on later content regeneration, so that I can defer translation.
28. As a user whose Current and Target languages differ, I want an explicit Translate current video action, so that I can update the existing video immediately.
29. As a user translating a multi-frame video, I want the full Content Graph translated consistently in one pass, so that terminology and tone remain coherent.
30. As a user translating a multi-frame video, I want node IDs, node kinds, edges, ordering, frame durations, and numeric data values preserved, so that translation does not change the storyboard.
31. As a user translating a video, I want every frame regenerated from the translated content while preserving template style and animation approach, so that only language changes.
32. As a user translating a single-frame video, I want the agent to preserve layout, palette, typography hierarchy, and animation while translating visible text, so that the visual design remains recognizable.
33. As a user translating a single-frame video, I want stable text identifiers preserved, so that inline editing continues to work.
34. As a user, I want translation to use the same agent and model selected for the project, so that I do not need another provider or credential.
35. As a user, I want the language selector disabled while generation or translation is running, so that one run cannot produce mixed-language output.
36. As a user, I want translation progress streamed in Studio, so that I know which stage is running.
37. As a user, I want a failed translation to preserve my original graph, frames, narration, audio, and Current content language, so that failure is non-destructive.
38. As a user, I want a successful translation to make the target language the project's Current content language, so that future content work continues consistently.
39. As a user with narration, I want narration text generated in the Current content language, so that voice and visible content match.
40. As a user translating a narrated video, I want narration text and audio regenerated, so that the spoken language matches the translated frames.
41. As a user translating a narrated video, I want the selected voice retained when compatible, so that the speaker identity remains stable.
42. As a user whose selected voice cannot speak the target language, I want Studio to ask me to select a compatible voice, so that it does not silently change the speaker.
43. As a user translating a video, I want background music preserved, so that language changes do not discard unrelated media.
44. As a user selecting Vietnamese or Chinese, I want templates to use fonts that contain the required glyphs, so that exported text does not display missing-character boxes.
45. As a user, I want Studio to warn when a template's declared font support does not cover the Target content language, so that I can make an informed choice.
46. As a user, I want a compatible fallback font applied when necessary, so that correct text rendering takes priority over exact font identity.
47. As a user, I want generated content checked for obvious language mismatch, so that agent mistakes are caught before export.
48. As a user, I want language validation to ignore brand names, URLs, code, numbers, and units, so that legitimate mixed technical content is not treated as failure.
49. As a user, I want language validation to warn and offer retry rather than block export, so that I remain in control.
50. As a user, I want missing-glyph and replacement-character warnings, so that exported video text remains readable.
51. As a user opening an older project, I want it to continue working with Automatic mode defaults, so that the schema change is backward compatible.
52. As a maintainer, I want content-language resolution isolated behind a small testable policy interface, so that prompt and UI code do not duplicate language rules.
53. As a maintainer, I want project language invariants enforced by domain operations rather than blind metadata patches, so that Current and Target language cannot drift accidentally.
54. As a maintainer, I want language-aware prompt construction centralized, so that graph, frame, single-frame, and narration prompts use the same contract.
55. As a maintainer, I want translation to stage output before committing project state, so that partial regeneration cannot corrupt an existing project.
56. As a maintainer, I want external-behavior tests for language resolution, generation, UI state, translation rollback, voice compatibility, and font fallback, so that the feature can evolve safely.

## Implementation Decisions

- Video content language is independent of Studio locale.
- V1 explicit choices are Automatic, Vietnamese, English, and Simplified Chinese.
- Automatic preserves Vietnamese, English, Simplified Chinese, and Traditional Chinese source languages.
- Automatic resolves unsupported or unidentifiable source languages to Vietnamese.
- Without source material, Automatic follows the opening request and falls back to English when unidentifiable.
- With multiple sources, the first supplied source determines Automatic language resolution.
- A project stores three distinct states: dropdown choice, concrete Target content language, and Current content language.
- Older projects without language fields default to Automatic behavior.
- The toolbar is the single user-facing place to select content language; the conversation format card does not duplicate the setting.
- Language choice is saved immediately at project level.
- The language control is disabled during generation and translation.
- Initial generation produces content directly in the Target content language.
- The language instruction is repeated in graph planning, every frame generation call, single-frame generation, and narration drafting.
- Translation uses the project's selected agent and model.
- Multi-frame translation translates the Content Graph once, then regenerates frames.
- Translation preserves graph identity, ordering, durations, numeric values, style, animation, and unrelated media.
- Single-frame translation regenerates complete HTML through the agent rather than replacing strings.
- Translation is staged and committed only after the full workflow succeeds.
- Restyle and retime preserve Current content language and wording.
- Content regeneration and explicit translation apply Target content language.
- Narration follows Current content language.
- An incompatible narration voice must be changed explicitly by the user; the system does not silently substitute voices.
- Background music is not regenerated during translation.
- Correct glyph support takes priority over preserving the exact template font.
- Templates may declare script support and language-specific fallback fonts.
- V1 also provides global fallback font families for Vietnamese, Simplified Chinese, and Traditional Chinese.
- Language validation is advisory and can offer retry; it does not hard-block export.
- A dedicated project content-language operation enforces resolution and Current/Target invariants.
- Translation is a long-running streamed operation.
- The design follows ADR-0001 and the terms defined in the domain glossary.

## Testing Decisions

- Tests assert external behavior and persisted outcomes rather than private helper implementation.
- Content Language Policy receives exhaustive table-driven unit tests for explicit choices, all Automatic resolution rules, first-source precedence, unsupported languages, unidentifiable input, and no-source fallback.
- Project-language operations receive persistence tests proving old projects remain readable and changing the dropdown does not mutate Current content language.
- Prompt tests verify that graph, frame, single-frame, regeneration, and narration requests receive the same concrete language contract.
- Studio API tests verify immediate persistence, Current/Target responses, disabled-in-progress behavior, and error responses.
- Studio UI behavior is tested around dropdown state, Automatic labels, Current/Target mismatch, and translation actions.
- Translation integration tests cover multi-frame preservation, single-frame visual constraints, successful commit, failed rollback, and streamed progress.
- Narration tests cover translated scripts, audio regeneration, compatible voice retention, incompatible voice rejection, and music preservation.
- Font compatibility tests cover declared support, fallback selection, warnings, and missing-glyph detection.
- Language validation tests use representative Vietnamese, English, Simplified Chinese, Traditional Chinese, and mixed technical text.
- Existing runtime and prompt-parsing test patterns may be reused, but this feature requires broader core and Studio coverage than currently exists.
- Render-level acceptance should inspect generated HTML and project state. A small number of end-to-end MP4 smoke tests should confirm Vietnamese and Chinese glyphs survive actual Linux rendering.

## Out of Scope

- Multiple simultaneous localized variants within one project.
- A separate translation provider or translation-specific credential.
- User-defined arbitrary language codes in v1.
- An explicit Traditional Chinese dropdown option in v1.
- Automatic silent replacement of an incompatible narration voice.
- Translating background music prompts or regenerating background music.
- Translating during restyle-only or retime-only operations.
- Perfect linguistic quality scoring or hard export blocking based on language heuristics.
- Full template marketplace migration to mandatory text-support metadata in one release.
- Cloud translation, collaboration, and localization workflow management.

## Further Notes

- Source-language detection must not inspect Studio locale.
- The concrete Target content language must be frozen for the duration of a generation or translation run.
- An English article with Vietnamese explicitly selected must produce Vietnamese on the first generation; the Translate action is only for an already-generated video.
- Traditional Chinese may appear only as an automatically resolved target/current value in v1.
- The detailed agreed design is recorded in `docs/design/video-content-language.md`.
- The architectural boundary is recorded in ADR-0001.

## Comments

