# Video content language in Studio

> Status: agreed design, not implemented  
> Date: 2026-06-10

## Goal

Let the user choose the language of generated video content from Studio without
coupling it to the language of the Studio interface.

Supported explicit choices in v1:

- Automatic
- Vietnamese
- English
- Simplified Chinese

Traditional Chinese is preserved when detected from source material in Automatic
mode, but it is not an explicit v1 dropdown choice.

## Canonical terms

- **Video content language choice**: the value selected in the toolbar.
- **Target content language**: the concrete language for the next generate,
  regenerate-content, or translate operation.
- **Current content language**: the language of the currently generated frames
  and narration.
- **Studio locale**: UI labels and controls; never participates in content
  language resolution.

See `CONTEXT.md` and ADR-0001.

## Project state

Extend `UserPreferences` with:

```ts
type ContentLanguageChoice = 'auto' | 'vi' | 'en' | 'zh-CN';
type ResolvedContentLanguage = 'vi' | 'en' | 'zh-CN' | 'zh-TW';

interface UserPreferences {
  // Existing fields omitted.
  language?: ContentLanguageChoice;
  targetLanguage?: ResolvedContentLanguage;
  contentLanguage?: ResolvedContentLanguage;
}
```

Semantics:

- `language`: toolbar dropdown choice, persisted immediately.
- `targetLanguage`: concrete language to use for the next content-producing
  operation.
- `contentLanguage`: language of the currently generated video.
- Old projects without these fields behave as `language: 'auto'`.
- Changing `language` or `targetLanguage` does not change
  `contentLanguage`.
- After successful initial generation, content regeneration, or translation,
  set `contentLanguage = targetLanguage`.
- On failure, preserve the previous graph, frames, narration, and
  `contentLanguage`.

These names should be revisited during implementation if the codebase adopts a
dedicated project language object. The three distinct states must remain.

## Automatic resolution

Resolve when:

- an explicit language choice changes
- generation starts
- source material changes and the choice is `auto`
- content regeneration starts

Rules:

1. If source material exists, use the primary language of the first source
   supplied by the user.
2. Preserve source languages:
   - Vietnamese -> `vi`
   - English -> `en`
   - Simplified Chinese -> `zh-CN`
   - Traditional Chinese -> `zh-TW`
3. Any other detected source language -> `vi`.
4. Unidentifiable source language -> `vi`.
5. Without source material, use the language of the user's opening request.
6. If the opening request is unidentifiable, use `en`.
7. Never inspect the Studio locale.

Once generation starts, the resolved target is frozen for that run. Adding a
later asset must not change the language of an in-progress generation.

## Studio UX

Add a persistent project-level toolbar control near Template and Agent:

```text
Content: [ Automatic v ]
```

Options:

```text
Automatic from source
Vietnamese
English
Chinese
```

For Automatic mode, show the concrete target:

```text
Automatic (English)
Automatic (Traditional Chinese)
Automatic (Vietnamese, translated from Japanese)
```

Save immediately through a project preference API. Do not put this field in the
conversation format card.

Disable the dropdown while generation or translation is running.

### Existing video

When target and current languages differ:

```text
Current: English
Target: Vietnamese

[Apply on content regeneration] [Translate current video]
```

Changing the dropdown alone must not mutate frames, graph, narration, or the
current-language badge.

Restyle and retime operations preserve current wording and therefore do not
apply a pending target-language change.

## Initial generation

If the user supplies an English article and selects Vietnamese before generation:

```text
English article
-> Vietnamese ContentGraph
-> Vietnamese HTML frames
-> Vietnamese narration
-> Vietnamese video
```

No separate translation action is required.

The concrete language instruction must be included in:

- ContentGraph planning prompt
- every per-frame HTML prompt
- single-frame generation prompt
- narration drafting prompt

Suggested prompt contract:

```text
TARGET CONTENT LANGUAGE: Vietnamese (vi).

Write all user-visible wording in Vietnamese.
Translate source material by meaning when required.
Preserve brand names, product names, URLs, code identifiers, versions,
numeric values, and units unless an established translation exists.
Do not mix languages except for those preserved terms.
```

Per-frame calls must repeat the instruction because each frame is an independent
agent invocation.

## Translate current video

Use the same agent and model selected by the project. Do not add a translation
provider in v1.

The operation must be recoverable:

1. Build translated content in temporary files/state.
2. Validate the translated result.
3. Generate replacement frames and narration.
4. Commit project state only after the full operation succeeds.
5. On failure, keep the old graph, frames, audio, and current language.

### Multi-frame

Translate the full ContentGraph in one agent call to keep terminology and tone
consistent.

The translated graph must preserve:

- schema version
- node IDs
- node kinds
- edges
- ordering
- frame durations
- numeric data values

It may translate:

- synopsis
- node text and labels
- string labels inside structured data

After graph translation, regenerate each frame using the normal per-frame prompt,
with the target-language instruction and existing visual/template constraints.

### Single-frame

Ask the agent to regenerate the current complete HTML:

- preserve layout, palette, typography hierarchy, and animation
- translate user-visible text
- preserve names, numbers, URLs, versions, code, and units
- retain stable `data-hv-text` keys

Do not perform raw string replacement in HTML. If `data-hv-text` coverage is
incomplete, warn that visual-text detection is less reliable.

## Restyle and retime

- Restyle keeps wording exactly and does not translate.
- Retime keeps wording exactly and does not translate.
- Content regeneration applies the current target language.
- Explicit "Translate current video" applies the current target language.

## Narration

Narration language follows `contentLanguage`.

When translating a video with narration:

1. Translate narration text consistently with the graph.
2. Regenerate narration audio.
3. Keep the selected voice only if it supports the target language.
4. If it does not, require the user to select a compatible voice.
5. Never silently switch voices.

Background music is unchanged.

V1 requires language-support metadata for each offered narration voice.

## Fonts and templates

Correct glyph rendering takes priority over preserving a template's exact font.

Template metadata should eventually declare script support and fallbacks:

```yaml
text_support:
  scripts: [latin, vietnamese]
  fallback_fonts:
    vi: "Be Vietnam Pro"
    zh-CN: "Noto Sans SC"
    zh-TW: "Noto Sans TC"
```

Global v1 fallbacks:

- Vietnamese: `Be Vietnam Pro`, `Noto Sans`
- English: template font
- Simplified Chinese: `Noto Sans SC`, `Noto Serif SC`
- Traditional Chinese: `Noto Sans TC`, `Noto Serif TC`

Studio should warn when the selected template does not declare support. Agent
prompts may replace the font while preserving hierarchy and visual character.

## Validation

After graph/frame generation, run language heuristics:

- Vietnamese target: warn when most natural-language text remains English or
  Chinese.
- English target: warn when most text remains Vietnamese or Chinese.
- Chinese target: warn when expected Han-character coverage is absent.
- Ignore brand names, URLs, code identifiers, numbers, and units.
- Detect replacement characters and obvious missing-glyph output.

Validation warns and offers retry; it does not hard-block export because technical
content legitimately mixes languages.

## API surface

Expected server operations:

```text
PUT  /api/projects/:id/content-language
POST /api/projects/:id/translate
```

The update endpoint persists the dropdown choice and resolved target. The
translate endpoint performs the atomic translation/regeneration workflow and
streams progress through SSE.

The existing generic project PATCH could technically store this preference, but
a dedicated endpoint is preferred because resolution and current/target
invariants are domain behavior, not a blind metadata patch.

## Implementation touchpoints

- `packages/core/src/types/index.ts`
- `packages/core/src/project.ts`
- `packages/cli/src/studio-server.ts`
- `packages/project-studio/public/app.js`
- `packages/project-studio/public/i18n.js`
- narration voice definitions and narration-generation routes
- template metadata/types for text support

## Acceptance scenarios

1. English article + explicit Vietnamese -> first generated video is Vietnamese.
2. Vietnamese article + Automatic -> Vietnamese.
3. English article + Automatic -> English.
4. Traditional Chinese article + Automatic -> Traditional Chinese.
5. Japanese article + Automatic -> Vietnamese.
6. No source + Vietnamese opening request + Automatic -> Vietnamese.
7. No source + unidentifiable opening request + Automatic -> English.
8. Existing English video + dropdown Vietnamese -> frames remain English until
   content regeneration or translation.
9. Existing English video + restyle with Vietnamese target pending -> remains
   English.
10. Translate multi-frame video -> node IDs, numbers, durations, ordering, style,
    and animation remain stable while visible wording changes.
11. Translation failure -> old video and current-language badge remain unchanged.
12. Narration voice incompatible with target -> user must choose a compatible
    voice; no silent substitution.
13. Studio locale changes -> target/current video language does not change.

