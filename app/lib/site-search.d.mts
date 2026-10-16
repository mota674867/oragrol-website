export type PublicSearchDocument = { href: string; title: string; text: string; category: string };
export type PublicSearchResult = { href: string; title: string; category: string; snippet: string; score: number };
export function normalizeSearchText(value: unknown): string;
export function isPublicSearchHref(value: unknown): boolean;
export function validateSearchIndex(index: unknown): readonly PublicSearchDocument[];
export function searchPublicDocuments(documents: readonly PublicSearchDocument[], query: string): PublicSearchResult[];
