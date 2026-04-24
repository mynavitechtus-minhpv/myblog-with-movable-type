/**
 * Article Prev/Next — client-side prev/next navigation from the same list API.
 *
 * Strategy: reuse the article list JSON (already filtered by display_target,
 * newsletter exclusion, etc.) instead of MT-native EntryPrevious/EntryNext,
 * which ignore MTML-level filters. This guarantees the detail page respects
 * the exact same visibility rules as the listing page.
 *
 * Config via data-* attributes on the container rendered by
 * azcom-article-prev-next-shell.mtml:
 *
 *   <nav id="article-prev-next"
 *        data-article-prev-next
 *        data-endpoint="api/news-list.json"
 *        data-current-entry-id="42">
 *   </nav>
 *
 * Ordering convention:
 *   API returns items newest first (items[0] = newest).
 *   UI: 前の記事 (prev) = older item   = items[idx + 1]
 *       次の記事 (next) = newer item   = items[idx - 1]
 *
 * Expected JSON payload (MT Data API v1 compatible):
 *   { totalResults: N, items: [{id, title, permalink, ...}] }
 *
 * Dependencies: api-client.js (global MTApiClient)
 */

(function () {
  'use strict';

  const CONTAINER_SELECTOR = '[data-article-prev-next]';
  const LABEL_PREV = '前の記事';
  const LABEL_NEXT = '次の記事';
  const CHEVRON_LEFT = '<svg class="c-article-prev-next__icon" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M6.5 1.5L3 5L6.5 8.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CHEVRON_RIGHT = '<svg class="c-article-prev-next__icon" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M3.5 1.5L7 5L3.5 8.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  function renderItem(item, dir) {
    if (!item) return '';

    const cls = `c-article-prev-next__item c-article-prev-next__item--${dir}`;
    const label = dir === 'prev' ? LABEL_PREV : LABEL_NEXT;
    const icon = dir === 'prev' ? CHEVRON_LEFT : CHEVRON_RIGHT;
    const inner = dir === 'prev'
      ? `${icon}<span class="c-article-prev-next__label">${label}</span>`
      : `<span class="c-article-prev-next__label">${label}</span>${icon}`;
    const aria = `${label}: ${item.title || ''}`;

    return `<a class="${cls}" href="${escapeHtml(item.permalink)}" rel="${dir}" aria-label="${escapeHtml(aria)}">${inner}</a>`;
  }

  class ArticlePrevNextController {
    constructor(container) {
      this.container = container;
      this.endpoint = container.dataset.endpoint || '';
      this.currentId = parseInt(container.dataset.currentEntryId, 10);
      this.apiClient = new MTApiClient();
    }

    hide() {
      this.container.hidden = true;
      this.container.innerHTML = '';
    }

    render(prev, next) {
      if (!prev && !next) {
        this.hide();
        return;
      }
      this.container.innerHTML = `${renderItem(prev, 'prev')}${renderItem(next, 'next')}`;
      this.container.hidden = false;
    }

    async load() {
      let data;
      try {
        data = await this.apiClient.getWithRetry(this.endpoint, { retries: 1 });
      } catch (err) {
        console.error('[article-prev-next] load failed:', err);
        this.hide();
        return;
      }

      const items = Array.isArray(data && data.items) ? data.items : [];
      const idx = items.findIndex((a) => Number(a.id) === this.currentId);
      if (idx < 0) {
        this.hide();
        return;
      }

      const prev = idx < items.length - 1 ? items[idx + 1] : null;
      const next = idx > 0 ? items[idx - 1] : null;
      this.render(prev, next);
    }

    init() {
      if (!this.endpoint || !this.currentId) {
        console.warn('[article-prev-next] data-endpoint and data-current-entry-id are required');
        this.hide();
        return;
      }
      this.load();
    }
  }

  function boot() {
    const container = document.querySelector(CONTAINER_SELECTOR);
    if (!container) return;
    new ArticlePrevNextController(container).init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
