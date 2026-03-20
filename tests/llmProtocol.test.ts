import test from 'node:test';
import assert from 'node:assert/strict';

import {
  extractTextFromLlmResponse,
  normalizeBaseUrl,
} from '../lib/llmProtocol.ts';

test('normalizeBaseUrl appends /v1 for chat api', () => {
  assert.equal(normalizeBaseUrl('https://example.com', 'chat'), 'https://example.com/v1');
  assert.equal(normalizeBaseUrl('https://example.com/v1/', 'chat'), 'https://example.com/v1');
});

test('normalizeBaseUrl keeps responses api base url unchanged except trailing slash', () => {
  assert.equal(normalizeBaseUrl('https://example.com/', 'responses'), 'https://example.com');
  assert.equal(normalizeBaseUrl('https://example.com/v1/', 'responses'), 'https://example.com/v1');
});

test('extractTextFromLlmResponse reads chat completions content', () => {
  const text = extractTextFromLlmResponse('chat', {
    choices: [
      {
        message: {
          content: '{"ok":true}',
        },
      },
    ],
  });

  assert.equal(text, '{"ok":true}');
});

test('extractTextFromLlmResponse reads responses api output_text', () => {
  const text = extractTextFromLlmResponse('responses', {
    output_text: '{"ok":true}',
  });

  assert.equal(text, '{"ok":true}');
});

test('extractTextFromLlmResponse falls back to responses content blocks', () => {
  const text = extractTextFromLlmResponse('responses', {
    output: [
      {
        content: [
          { type: 'output_text', text: '{"ok":true}' },
        ],
      },
    ],
  });

  assert.equal(text, '{"ok":true}');
});
