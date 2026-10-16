"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { searchPublicDocuments, validateSearchIndex, type PublicSearchDocument } from '../../lib/site-search.mjs';
import styles from './public-site-search.module.css';
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
/** Every search icon on the site: English label plus the French labels used by bilingual pages. */
const SEARCH_TRIGGER = 'button[aria-label="Search"], button[aria-label="Recherche"], button[aria-label="Rechercher"]';

/** One search controller for every site search icon (see SEARCH_TRIGGER). */
export function PublicSiteSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [documents, setDocuments] = useState<readonly PublicSearchDocument[] | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [retry, setRetry] = useState(0);
  const [visibleCount, setVisibleCount] = useState(10);
  const mounted = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const id = useId();
  const results = documents ? searchPublicDocuments(documents, query) : [];

  useEffect(() => {
    const activate = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLButtonElement>(SEARCH_TRIGGER) : null;
      if (!target || target.disabled || target.closest('[role="dialog"], dialog')) return;
      event.preventDefault();
      event.stopPropagation();
      trigger.current = target;
      target.setAttribute('aria-haspopup', 'dialog');
      target.setAttribute('aria-expanded', 'true');
      target.setAttribute('aria-controls', `${id}-dialog`);
      setStatus(current => current === 'ready' ? current : 'loading');
      setQuery(''); setVisibleCount(10); setOpen(true);
    };
    document.addEventListener('click', activate, true);
    return () => document.removeEventListener('click', activate, true);
  }, [id]);

  useEffect(() => {
    if (!mounted) return;
    if (!open) { dialog.current?.close(); return; }
    dialog.current?.showModal(); input.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open, mounted]);

  useEffect(() => {
    if (!open || documents) return;
    const controller = new AbortController();
    fetch('/site-search-index.json', { credentials: 'omit', signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('SEARCH_UNAVAILABLE'); return response.json(); })
      .then(index => { setDocuments(validateSearchIndex(index)); setStatus('ready'); })
      .catch(() => { if (!controller.signal.aborted) setStatus('error'); });
    return () => controller.abort();
  }, [open, documents, retry]);

  const close = () => {
    dialog.current?.close(); setOpen(false);
    trigger.current?.setAttribute('aria-expanded', 'false');
    if (trigger.current?.isConnected) trigger.current.focus();
  };

  if (!mounted) return null;
  return createPortal(
    <dialog id={`${id}-dialog`} ref={dialog} className={styles.dialog} aria-labelledby={`${id}-title`}
      onCancel={event => { event.preventDefault(); close(); }}
      onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); return; }
        if (event.key !== 'Tab') return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), a[href]'))
          .filter(element => element.getClientRects().length > 0);
        const first = controls[0], last = controls[controls.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }}
      onClick={event => { if (event.target === dialog.current) close(); }}>
      <div className={styles.panel}>
        <div className={styles.heading}>
          <h2 id={`${id}-title`}>Search the website</h2>
          <button type="button" onClick={close} className={styles.close} aria-label="Close search">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>
        <form role="search" onSubmit={event => {
          event.preventDefault();
          dialog.current?.querySelector<HTMLAnchorElement>('[data-search-result]')?.click();
        }}>
          <label htmlFor={`${id}-input`} className={styles.label}>Search all public pages and articles</label>
          <div className={styles.field}>
            <input ref={input} id={`${id}-input`} type="search" autoComplete="off" spellCheck={false} maxLength={160}
              value={query} placeholder="Try OR ONE, automation, MFA or billing"
              aria-describedby={`${id}-status`} onChange={event => { setQuery(event.target.value); setVisibleCount(10); }}
              onKeyDown={event => {
                if (event.key === 'ArrowDown') { event.preventDefault(); dialog.current?.querySelector<HTMLAnchorElement>('[data-search-result]')?.focus(); }
              }} />
            {query && <button type="button" onClick={() => { setQuery(''); setVisibleCount(10); input.current?.focus(); }} className={styles.clear}>Clear</button>}
          </div>
        </form>
        <div id={`${id}-status`} className={styles.status} role="status" aria-live="polite">
          {status === 'loading' ? 'Loading website content…' : status === 'error' ? 'Search could not load. Please try again.' :
            query.trim().length < 2 ? 'Type at least two characters to find a page.' :
              results.length ? `${results.length} ${results.length === 1 ? 'result' : 'results'} found.` : 'No results found. Try another word or a shorter phrase.'}
        </div>
        {status === 'error' && <button type="button" className={styles.retry} onClick={() => { setStatus('loading'); setRetry(value => value + 1); }}>Try again</button>}
        <ul className={styles.results} aria-label="Search results">
          {results.slice(0, visibleCount).map(result => <li key={result.href}>
            <a href={result.href} data-search-result onClick={close} className={styles.result}>
              <strong>{result.title}</strong><span className={styles.category}>{result.category} · {result.href}</span>
              <span className={styles.snippet}>{result.snippet}</span>
            </a>
          </li>)}
        </ul>
        {results.length > visibleCount && <button type="button" className={styles.more} onClick={() => setVisibleCount(value => value + 10)}>Show more results</button>}
      </div>
    </dialog>, document.body,
  );
}
