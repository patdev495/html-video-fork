# html-video

Domain language for turning source material into agent-authored HTML video projects.

## Language

**Video content language**:
The language used for all user-visible wording and narration in an exported video.
_Avoid_: Studio language, UI language

**Automatic content language**:
A video content language choice that preserves supported source languages, translates unsupported source languages to Vietnamese, or follows the user's opening request when no source material exists.
_Avoid_: UI locale, Studio locale

**Target content language**:
The concrete language that the next generation, content regeneration, or translation operation should produce.
_Avoid_: Current content language, detected UI language

**Current content language**:
The language of the wording and narration in the project's currently generated video.
_Avoid_: Target content language, Studio locale

**Studio locale**:
The language used by Studio controls, labels, and system messages, independent of the video content language.
_Avoid_: Video language, output language

## Relationships

- A **Video Project** has exactly one **Video content language** choice.
- **Automatic content language** preserves Vietnamese, English, Simplified Chinese, or Traditional Chinese source language; other source languages produce a Vietnamese **Target content language**.
- Without source material, **Automatic content language** produces one **Target content language** from the user's opening request.
- The **Target content language** becomes the **Current content language** only after generation, content regeneration, or translation succeeds.
- Changing the **Video content language** choice does not mutate the **Current content language**.
- The **Studio locale** does not determine the **Video content language**.

## Example dialogue

> **Dev:** "The Studio locale is Vietnamese, but the article is English and the project uses Automatic content language. Which language should the video use?"
> **Domain expert:** "English. Studio locale only affects the interface."

## Flagged ambiguities

- "Language" previously could mean either interface language or generated-video language. Use **Studio locale** and **Video content language** as distinct terms.
