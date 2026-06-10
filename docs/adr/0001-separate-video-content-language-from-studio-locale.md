---
status: accepted
---

# Separate video content language from Studio locale

A Video Project owns an explicit content-language choice that is independent of
the Studio locale. The project records the dropdown choice, the concrete target
language for the next content-producing operation, and the language of the
currently generated video so changing the dropdown never silently rewrites or
mislabels existing output.

Automatic selection preserves Vietnamese, English, Simplified Chinese, and
Traditional Chinese source material. Other or unidentifiable source languages
resolve to Vietnamese. Without source material, automatic selection follows the
user's opening request and falls back to English only when that request cannot be
classified.

