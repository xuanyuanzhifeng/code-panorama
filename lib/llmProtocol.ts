export type LlmApiType = 'chat' | 'responses';

export function normalizeApiType(value: unknown): LlmApiType {
  return value === 'responses' ? 'responses' : 'chat';
}

export function normalizeBaseUrl(url: string, apiType: LlmApiType = 'chat'): string {
  if (!url) return url;
  const normalized = url.replace(/\/+$/, '');
  if (apiType === 'responses') return normalized;
  return normalized.endsWith('/v1') ? normalized : `${normalized}/v1`;
}

export function extractTextFromLlmResponse(apiType: LlmApiType, response: any): string {
  if (apiType === 'responses') {
    const directText = response?.output_text;
    if (typeof directText === 'string' && directText.trim()) {
      return directText;
    }

    const output = Array.isArray(response?.output) ? response.output : [];
    for (const item of output) {
      const content = Array.isArray(item?.content) ? item.content : [];
      for (const block of content) {
        const text = block?.text ?? block?.content?.[0]?.text;
        if (typeof text === 'string' && text.trim()) {
          return text;
        }
      }
    }

    return '';
  }

  const text = response?.choices?.[0]?.message?.content;
  return typeof text === 'string' ? text : String(text || '');
}
