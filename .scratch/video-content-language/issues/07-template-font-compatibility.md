# Template font compatibility and fallback

Status: ready-for-human

## Parent

`.scratch/video-content-language/PRD.md`

## What to build

Add language/script compatibility information for templates and ensure generated
Vietnamese and Chinese text renders with complete glyph coverage.

Templates may declare supported scripts and language-specific fallback fonts.
Studio warns when the selected template does not support the Target content
language. Generation prompts may replace an incompatible font while preserving
the template's hierarchy and visual character. Global fallbacks cover
Vietnamese, Simplified Chinese, and Traditional Chinese.

This slice requires human visual review because acceptable typography cannot be
verified by type checks alone.

## Acceptance criteria

- [ ] Template metadata can declare supported scripts and language-specific fallback fonts.
- [ ] Existing template metadata remains backward compatible.
- [ ] Studio warns when the selected template does not declare support for the Target content language.
- [ ] Vietnamese generation can fall back to a font with full Vietnamese glyph coverage.
- [ ] Simplified Chinese generation can fall back to a compatible Simplified Chinese font.
- [ ] Traditional Chinese Automatic output can fall back to a compatible Traditional Chinese font.
- [ ] Font substitution preserves typography hierarchy and visual character as closely as practical.
- [ ] Render validation detects replacement characters or obvious missing glyphs.
- [ ] Linux MP4 smoke renders demonstrate readable Vietnamese, Simplified Chinese, and Traditional Chinese text.
- [ ] A human reviews representative template outputs for hierarchy, wrapping, clipping, and visual quality.

## Blocked by

- `.scratch/video-content-language/issues/01-explicit-language-first-generation.md`

## Comments

