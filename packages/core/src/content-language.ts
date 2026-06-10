export type ContentLanguageChoice = 'auto' | 'vi' | 'en' | 'zh-CN';
export type ResolvedContentLanguage = 'vi' | 'en' | 'zh-CN' | 'zh-TW';

export interface ContentLanguageSource {
  text: string;
  language?: string;
}

export interface ResolveContentLanguageInput {
  choice: ContentLanguageChoice;
  currentLanguage?: ResolvedContentLanguage;
  sources?: ContentLanguageSource[];
  openingRequest?: string;
}

export interface ContentLanguageResolution {
  choice: ContentLanguageChoice;
  targetLanguage: ResolvedContentLanguage;
  currentLanguage?: ResolvedContentLanguage;
  reason: 'explicit' | 'source' | 'unsupported-source' | 'opening-request' | 'fallback';
  detectedSourceLanguage?: string;
}

const SUPPORTED_LANGUAGES = new Set<ResolvedContentLanguage>([
  'vi',
  'en',
  'zh-CN',
  'zh-TW',
]);

function isSupportedLanguage(value: string | undefined): value is ResolvedContentLanguage {
  return value !== undefined && SUPPORTED_LANGUAGES.has(value as ResolvedContentLanguage);
}

const LANGUAGE_NAMES: Record<ResolvedContentLanguage, string> = {
  vi: 'Vietnamese',
  en: 'English',
  'zh-CN': 'Simplified Chinese',
  'zh-TW': 'Traditional Chinese',
};

export function contentLanguageInstruction(language: ResolvedContentLanguage): string {
  return [
    `CONTENT LANGUAGE (REQUIRED): Write the video in ${LANGUAGE_NAMES[language]}.`,
    'This applies to every visible text string, all content graph text fields, captions, labels, calls to action, and narration.',
    'Translate source prose as needed, but preserve proper names, product names, code identifiers, numbers, and URLs unless a standard localized form is clearly appropriate.',
    'Do not follow the Studio interface language or the source language when they differ from this requirement.',
  ].join(' ');
}

export function detectContentLanguage(text: string): string | undefined {
  const sample = text.trim();
  if (!sample) return undefined;

  if (/[\u3040-\u30ff]/u.test(sample)) return 'ja';
  if (/[\uac00-\ud7af]/u.test(sample)) return 'ko';

  const han = sample.match(/[\u3400-\u9fff]/gu)?.length ?? 0;
  if (han > 0) {
    const traditional = sample.match(
      /[\u9ad4\u570b\u81fa\u7063\u8207\u70ba\u9019\u500b\u5011\u5b78\u8aaa\u5f8c\u4f86\u6642\u6703\u767c\u73fe]/gu,
    )?.length ?? 0;
    const simplified = sample.match(
      /[\u4f53\u56fd\u53f0\u4e0e\u4e3a\u8fd9\u4e2a\u4eec\u5b66\u8bf4\u540e\u6765\u65f6\u4f1a\u53d1\u73b0]/gu,
    )?.length ?? 0;
    return traditional > simplified ? 'zh-TW' : 'zh-CN';
  }

  if (/[\u0102\u0103\u00c2\u00e2\u0110\u0111\u00ca\u00ea\u00d4\u00f4\u01a0\u01a1\u01af\u01b0\u1ea0-\u1ef9]/u.test(sample)) {
    return 'vi';
  }

  const words = sample.toLowerCase().match(/[a-z]+/g) ?? [];
  const englishMarkers = new Set([
    'a', 'an', 'and', 'are', 'article', 'create', 'for', 'from', 'in', 'is',
    'of', 'product', 'the', 'this', 'to', 'video', 'with',
  ]);
  if (words.filter((word) => englishMarkers.has(word)).length >= 2) return 'en';
  return undefined;
}

export function resolveContentLanguage(
  input: ResolveContentLanguageInput,
): ContentLanguageResolution {
  if (input.choice !== 'auto') {
    return {
      choice: input.choice,
      targetLanguage: input.choice,
      ...(input.currentLanguage !== undefined && {
        currentLanguage: input.currentLanguage,
      }),
      reason: 'explicit',
    };
  }

  const firstSource = input.sources?.[0];
  if (firstSource) {
    const detected = firstSource.language || detectContentLanguage(firstSource.text);
    if (isSupportedLanguage(detected)) {
      return {
        choice: 'auto',
        targetLanguage: detected,
        ...(input.currentLanguage !== undefined && {
          currentLanguage: input.currentLanguage,
        }),
        reason: 'source',
        detectedSourceLanguage: detected,
      };
    }

    return {
      choice: 'auto',
      targetLanguage: 'vi',
      ...(input.currentLanguage !== undefined && {
        currentLanguage: input.currentLanguage,
      }),
      reason: 'unsupported-source',
      ...(detected !== undefined && { detectedSourceLanguage: detected }),
    };
  }

  if (input.openingRequest) {
    const detected = detectContentLanguage(input.openingRequest);
    if (isSupportedLanguage(detected)) {
      return {
        choice: 'auto',
        targetLanguage: detected,
        ...(input.currentLanguage !== undefined && {
          currentLanguage: input.currentLanguage,
        }),
        reason: 'opening-request',
      };
    }
  }

  return {
    choice: 'auto',
    targetLanguage: 'en',
    ...(input.currentLanguage !== undefined && {
      currentLanguage: input.currentLanguage,
    }),
    reason: 'fallback',
  };
}
