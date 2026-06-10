import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  contentLanguageInstruction,
  resolveContentLanguage,
} from '../dist/index.js';

test('an explicit language choice becomes the target without changing current content', () => {
  const result = resolveContentLanguage({
    choice: 'vi',
    currentLanguage: 'en',
    sources: [{ text: 'An English source article', language: 'en' }],
    openingRequest: 'Create a product video',
  });

  assert.deepEqual(result, {
    choice: 'vi',
    targetLanguage: 'vi',
    currentLanguage: 'en',
    reason: 'explicit',
  });
});

test('automatic language preserves the first supported source language', () => {
  const result = resolveContentLanguage({
    choice: 'auto',
    currentLanguage: 'vi',
    sources: [
      { text: 'The first article is written in English and explains the product.' },
      { text: 'Bài viết thứ hai được viết bằng tiếng Việt.' },
    ],
    openingRequest: 'Hãy tạo video',
  });

  assert.deepEqual(result, {
    choice: 'auto',
    targetLanguage: 'en',
    currentLanguage: 'vi',
    reason: 'source',
    detectedSourceLanguage: 'en',
  });
});

test('automatic language falls back to Vietnamese for an unsupported source', () => {
  const result = resolveContentLanguage({
    choice: 'auto',
    sources: [{ text: '新しい製品についての記事です。' }],
    openingRequest: 'Create a concise video',
  });

  assert.equal(result.targetLanguage, 'vi');
  assert.equal(result.detectedSourceLanguage, 'ja');
  assert.equal(result.reason, 'unsupported-source');
});

test('automatic language uses the opening request only when there is no source', () => {
  const result = resolveContentLanguage({
    choice: 'auto',
    openingRequest: 'Hãy tạo video ngắn giới thiệu sản phẩm này',
  });

  assert.equal(result.targetLanguage, 'vi');
  assert.equal(result.reason, 'opening-request');
});

test('automatic language defaults to English when no source or opening language is identifiable', () => {
  const result = resolveContentLanguage({
    choice: 'auto',
    openingRequest: '12345',
  });

  assert.equal(result.targetLanguage, 'en');
  assert.equal(result.reason, 'fallback');
});

test('generation instruction covers visible copy, graph text, and narration', () => {
  const instruction = contentLanguageInstruction('vi');

  assert.match(instruction, /Vietnamese/);
  assert.match(instruction, /visible/i);
  assert.match(instruction, /content graph/i);
  assert.match(instruction, /narration/i);
  assert.match(instruction, /proper names/i);
});
