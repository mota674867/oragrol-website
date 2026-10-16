/** Public-content keyword search only: no AI, API, cookies, storage or analytics. */
export function normalizeSearchText(value) {
  return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}

export function isPublicSearchHref(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[?#\\\x00-\x20]/.test(value)) return false;
  return !/(?:^|\/)(?:api|internal|dashboard|admin|login|sign-in|auth|style-guide|_development-preview|ops|scan)(?:\/|$)/i.test(value) &&
    !/%|\.\./.test(value);
}

export function validateSearchIndex(index) {
  if (!index || index.version !== 1 || !Array.isArray(index.documents) || index.documents.length > 2000) throw new Error('SEARCH_INDEX_INVALID');
  const seen = new Set();
  const documents = index.documents.map(document => {
    if (!document || !isPublicSearchHref(document.href) || seen.has(document.href) ||
        typeof document.title !== 'string' || !document.title.trim() || document.title.length > 300 ||
        typeof document.text !== 'string' || document.text.length > 150_000 || typeof document.category !== 'string' || document.category.length > 80) throw new Error('SEARCH_INDEX_INVALID');
    seen.add(document.href);
    return Object.freeze({ href: document.href, title: document.title, text: document.text, category: document.category });
  });
  return Object.freeze(documents);
}

const documentFields = new WeakMap();
function normalizedOffsets(value) {
  let text = '', offset = 0; const offsets = [];
  for (const character of value) {
    const folded = character.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    for (const part of folded) {
      if (/^[\p{L}\p{N}]$/u.test(part)) {
        text += part; for (let i=0;i<part.length;i++) offsets.push(offset);
      } else if (text && !text.endsWith(' ')) { text += ' '; offsets.push(offset); }
    }
    offset += character.length;
  }
  if (text.endsWith(' ')) { text = text.slice(0,-1); offsets.pop(); }
  return { text, offsets };
}

export function searchPublicDocuments(documents, query) {
  const phrase = normalizeSearchText(String(query ?? '').slice(0, 160));
  if (phrase.length < 2) return [];
  const tokens = [...new Set(phrase.split(' '))];
  return documents.flatMap(document => {
    let fields = documentFields.get(document);
    if (!fields) {
      const title = normalizeSearchText(document.title), body = normalizeSearchText(document.text), category = normalizeSearchText(document.category);
      fields = { title, body, category, titleWords: new Set(title.split(' ')), categoryWords: new Set(category.split(' ')), words: new Set(`${title} ${category} ${body}`.split(' ')) };
      documentFields.set(document, fields);
    }
    const { title, body, category, titleWords, categoryWords, words } = fields;
    if (!tokens.every(token => words.has(token))) return [];
    const paddedPhrase = ` ${phrase} `;
    if (phrase === 'or one' && ![title, body, category].some(value => ` ${value} `.includes(paddedPhrase))) return [];
    const score = (title === phrase ? 200 : title.startsWith(`${phrase} `) ? 140 : ` ${title} `.includes(paddedPhrase) ? 80 : 0) +
      tokens.reduce((sum, token) => sum + (titleWords.has(token) ? 12 : 0) + (categoryWords.has(token) ? 3 : 0), 0);
    fields.originalOffsets ??= normalizedOffsets(document.text);
    const normalized = ` ${fields.originalOffsets.text} `;
    const phrasePosition = normalized.indexOf(paddedPhrase);
    const matches = tokens.map(token => normalized.indexOf(` ${token} `)).filter(index => index >= 0);
    const position = phrasePosition >= 0 ? phrasePosition : matches.length ? Math.min(...matches) : -1;
    const originalPosition = position >= 0 ? fields.originalOffsets.offsets[position] ?? 0 : 0;
    const start = Math.max(0, originalPosition - 50);
    const snippet = `${start ? '…' : ''}${document.text.slice(start, start + 190).trim()}${document.text.length > start + 190 ? '…' : ''}`;
    return [{ href: document.href, title: document.title, category: document.category, snippet, score }];
  }).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'en') || a.href.localeCompare(b.href));
}
