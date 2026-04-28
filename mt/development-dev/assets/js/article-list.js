/**
 * Article List — generic client-side article grid + pagination.
 *
 * Strategy: server returns ALL filtered articles in one JSON; this module
 * slices them client-side based on data-page-size. This avoids MT-native
 * pagination limitations with MTML-level filtering (newsletter exclusion,
 * CF display_target filter, etc.).
 *
 * Zero blog-specific logic. Config via data-* attributes on the container
 * rendered by azcom-article-list-shell.mtml:
 *
 *   <div data-article-list
 *        data-list-endpoint="api/news-list.json"
 *        data-page-size="10"
 *        data-scroll-target="#main"
 *        data-empty-message="お知らせはまだありません。"
 *        data-filter-tag="新着"                       (optional)
 *        data-filter-category-label="プレスリリース"  (optional)>
 *   </div>
 *
 * Filters are applied AFTER fetch, BEFORE pagination slicing. Matching is
 * case-insensitive. Multiple filters are combined with AND.
 *
 * Expected JSON payload (MT Data API v1 compatible):
 *   { totalResults: N, items: [{id, title, basename, permalink, createdDate,
 *     categories: [label,...], tags: [name,...], blog: {id}, thumbnail,
 *     excerpt}] }
 *
 * DOM contract (IDs, rendered by the shell module):
 *   #article-list-skeleton   — initial skeleton placeholders
 *   #article-list-container  — grid of .c-article-card
 *   #article-list-empty      — empty state
 *   #article-list-error      — error state (role="alert")
 *   #article-list-pagination — nav container
 *
 * Dependencies: api-client.js (global MTApiClient)
 */

(function () {
  'use strict';

  const SELECTORS = {
    container: '#article-list-container',
    skeleton: '#article-list-skeleton',
    empty: '#article-list-empty',
    error: '#article-list-error',
    pagination: '#article-list-pagination',
  };

  const ERROR_MESSAGES = {
    network: '接続に失敗しました。ネットワークをご確認ください。',
    timeout: '読み込みに時間がかかっています。もう一度お試しください。',
    http404: 'ページが見つかりません。',
    http5xx: 'サーバーエラーが発生しました。しばらくしてから再度お試しください。',
    parse: 'データの読み込みに失敗しました。',
    unknown: '記事の読み込みに失敗しました。',
  };

  const DEFAULT_PAGE_SIZE = 10;

  function $(selector) {
    return document.querySelector(selector);
  }

  function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  const NEW_BADGE_DAYS = 7;

  function isRecentDate(iso, days) {
    if (!iso) return false;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return false;
    const diff = Date.now() - d.getTime();
    return diff >= 0 && diff < days * 24 * 60 * 60 * 1000;
  }

  function formatDisplayDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  }

  function buildArticleCard(item) {
    const thumbnail = item.thumbnail
      ? `<img class="c-article-card__thumb-img"
             src="${escapeHtml(item.thumbnail)}"
             alt=""
             width="400"
             height="225"
             loading="lazy">`
      : `<div class="c-article-card__thumb-placeholder"></div>`;

    const newBadge = isRecentDate(item.createdDate, NEW_BADGE_DAYS)
      ? `<span class="c-article-card__new-badge" aria-label="新着">NEW</span>`
      : '';

    const tags =
      Array.isArray(item.tags) && item.tags.length > 0
        ? `<ul class="c-article-card__tag-list">${item.tags
            .map((t) => `<li class="c-article-card__tag-item">${escapeHtml(t)}</li>`)
            .join('')}</ul>`
        : '';

    return `
      <a class="c-article-card"
         href="${escapeHtml(item.permalink)}"
         aria-label="${escapeHtml(item.title)}">
        <div class="c-article-card__thumb" aria-hidden="true">
          ${thumbnail}
          ${newBadge}
        </div>
        <div class="c-article-card__body">
          <div class="c-article-card__meta-block">
            <time class="c-article-card__date" datetime="${escapeHtml(item.createdDate)}">
              ${escapeHtml(formatDisplayDate(item.createdDate))}
            </time>
            <h3 class="c-article-card__title">${escapeHtml(item.title)}</h3>
          </div>
          ${tags}
        </div>
      </a>
    `;
  }

  const CHEVRON_SVG = '<svg class="c-pagination__icon" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M3.5 1.5L7 5L3.5 8.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const PAGINATION_WINDOW = 4;

  function iconPrev() {
    return `<span class="c-pagination__icon-wrap" style="display:inline-flex;transform:rotate(180deg)">${CHEVRON_SVG}</span>`;
  }
  function iconNext() {
    return CHEVRON_SVG;
  }
  function iconFirst() {
    return `<span class="c-pagination__icon-wrap" style="display:inline-flex;transform:rotate(180deg);gap:0">${CHEVRON_SVG}${CHEVRON_SVG}</span>`;
  }
  function iconLast() {
    return `${CHEVRON_SVG}${CHEVRON_SVG}`;
  }

  function navItem({ enabled, page, pageUrl, rel, ariaLabel, content }) {
    if (enabled) {
      return `<li class="c-pagination__item">
        <a class="c-pagination__link" href="${pageUrl(page)}"${rel ? ` rel="${rel}"` : ''} aria-label="${ariaLabel}">${content}</a>
      </li>`;
    }
    return `<li class="c-pagination__item">
      <span class="c-pagination__link c-pagination__link--disabled" aria-disabled="true" aria-label="${ariaLabel}">${content}</span>
    </li>`;
  }

  function paginationWindow(page, totalPages, size) {
    const half = Math.floor((size - 1) / 2);
    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, start + size - 1);
    start = Math.max(1, end - size + 1);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  function buildPagination(state) {
    const { page, totalPages } = state;
    if (totalPages <= 1) return '';

    const pageUrl = (p) => `?page=${p}`;
    const items = [];
    const hasPrev = page > 1;
    const hasNext = page < totalPages;

    items.push(navItem({
      enabled: hasPrev,
      page: 1,
      pageUrl,
      ariaLabel: '最初のページへ',
      content: iconFirst(),
    }));

    items.push(navItem({
      enabled: hasPrev,
      page: page - 1,
      pageUrl,
      rel: 'prev',
      ariaLabel: '前のページへ',
      content: iconPrev(),
    }));

    const windowPages = paginationWindow(page, totalPages, PAGINATION_WINDOW);
    windowPages.forEach((i) => {
      if (i === page) {
        items.push(
          `<li class="c-pagination__item">
            <span class="c-pagination__link c-pagination__link--active" aria-current="page">${i}</span>
          </li>`
        );
      } else {
        items.push(
          `<li class="c-pagination__item">
            <a class="c-pagination__link" href="${pageUrl(i)}" aria-label="${i}ページへ">${i}</a>
          </li>`
        );
      }
    });

    items.push(navItem({
      enabled: hasNext,
      page: page + 1,
      pageUrl,
      rel: 'next',
      ariaLabel: '次のページへ',
      content: iconNext(),
    }));

    items.push(navItem({
      enabled: hasNext,
      page: totalPages,
      pageUrl,
      ariaLabel: '最後のページへ',
      content: iconLast(),
    }));

    return `<ul class="c-pagination__list">${items.join('')}</ul>`;
  }

  function classifyError(err) {
    if (!err) return { key: 'unknown', retriable: true };
    if (err.type === 'network') return { key: 'network', retriable: true };
    if (err.type === 'timeout') return { key: 'timeout', retriable: true };
    if (err.type === 'parse') return { key: 'parse', retriable: true };
    if (err.type === 'http') {
      if (err.status === 404) return { key: 'http404', retriable: false, notFound: true };
      if (err.status >= 500) return { key: 'http5xx', retriable: true };
      return { key: 'unknown', retriable: true };
    }
    return { key: 'unknown', retriable: true };
  }

  class ArticleListController {
    constructor(container) {
      this.container = container;
      this.skeleton = $(SELECTORS.skeleton);
      this.empty = $(SELECTORS.empty);
      this.errorEl = $(SELECTORS.error);
      this.pagination = $(SELECTORS.pagination);

      this.listEndpoint = container.dataset.listEndpoint || '';
      this.pageSize = parseInt(container.dataset.pageSize || DEFAULT_PAGE_SIZE, 10);
      if (!this.pageSize || this.pageSize < 1) this.pageSize = DEFAULT_PAGE_SIZE;
      this.scrollTarget = container.dataset.scrollTarget || '#main';
      this.emptyMessage = container.dataset.emptyMessage || '';
      this.filterTag = (container.dataset.filterTag || '').trim();
      this.filterCategoryLabel = (container.dataset.filterCategoryLabel || '').trim();

      this.apiClient = new MTApiClient();

      this.allItems = null;

      this.onPaginationClick = this.onPaginationClick.bind(this);
      this.onPopState = this.onPopState.bind(this);
      this.onRetry = this.onRetry.bind(this);
      this.onGoToFirstPage = this.onGoToFirstPage.bind(this);

      this.currentPage = this._readPageFromUrl();
    }

    _readPageFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const page = parseInt(params.get('page') || '1', 10);
      return page > 0 ? page : 1;
    }

    show(which) {
      const states = ['skeleton', 'container', 'empty', 'error', 'pagination'];
      const map = {
        skeleton: this.skeleton,
        container: this.container,
        empty: this.empty,
        error: this.errorEl,
        pagination: this.pagination,
      };

      const DISPLAY_MAP = {
        container: 'flex',
        pagination: 'flex',
      };

      const visible = new Set(which);
      states.forEach((name) => {
        const el = map[name];
        if (!el) return;
        if (visible.has(name)) {
          el.style.display = DISPLAY_MAP[name] || 'block';
        } else {
          el.style.display = 'none';
        }
      });
    }

    showError(err) {
      const info = classifyError(err);
      const msg = ERROR_MESSAGES[info.key] || ERROR_MESSAGES.unknown;

      let actionHtml = '';
      if (info.notFound) {
        actionHtml = `<button type="button" class="c-button c-button--outline" data-article-list-action="first">1ページ目へ戻る</button>`;
      } else if (info.retriable) {
        actionHtml = `<button type="button" class="c-button c-button--outline" data-article-list-action="retry">再試行</button>`;
      }

      if (this.errorEl) {
        this.errorEl.innerHTML = `
          <p class="p-article-list__error-message">${escapeHtml(msg)}</p>
          ${actionHtml}
        `;
      }
      this.show(['error']);
    }

    _applyFilters(items) {
      if (!this.filterTag && !this.filterCategoryLabel) return items;

      const tagLower = this.filterTag.toLowerCase();
      const catLower = this.filterCategoryLabel.toLowerCase();

      return items.filter((item) => {
        if (tagLower) {
          const tags = Array.isArray(item.tags) ? item.tags : [];
          const matched = tags.some(
            (t) => typeof t === 'string' && t.toLowerCase() === tagLower
          );
          if (!matched) return false;
        }
        if (catLower) {
          const cats = Array.isArray(item.categories) ? item.categories : [];
          const matched = cats.some(
            (c) => typeof c === 'string' && c.toLowerCase() === catLower
          );
          if (!matched) return false;
        }
        return true;
      });
    }

    _renderPage(page) {
      const items = this._applyFilters(this.allItems || []);
      const total = items.length;
      const totalPages = Math.max(1, Math.ceil(total / this.pageSize));

      const safePage = Math.min(Math.max(1, page), totalPages);
      this.currentPage = safePage;

      if (total === 0) {
        if (this.empty) {
          this.empty.innerHTML = `<p role="status">${escapeHtml(this.emptyMessage)}</p>`;
        }
        this.show(['empty']);
        return;
      }

      const start = (safePage - 1) * this.pageSize;
      const slice = items.slice(start, start + this.pageSize);

      this.container.innerHTML = slice.map(buildArticleCard).join('');
      this.pagination.innerHTML = buildPagination({ page: safePage, totalPages });

      const visible = ['container'];
      if (totalPages > 1) visible.push('pagination');
      this.show(visible);
    }

    async loadAll() {
      this.show(['skeleton']);

      let data;
      try {
        data = await this.apiClient.getWithRetry(this.listEndpoint, { retries: 2 });
      } catch (err) {
        console.error('[article-list] load failed:', err);
        this.showError(err);
        return;
      }

      if (!data || !Array.isArray(data.items)) {
        this.showError({ type: 'parse', message: 'invalid payload shape' });
        return;
      }

      this.allItems = data.items;
      this._renderPage(this.currentPage);
    }

    goToPage(page) {
      this._renderPage(page);
      this._scrollToTop();
    }

    _scrollToTop() {
      if (!this.scrollTarget) return;
      const target = document.querySelector(this.scrollTarget);
      if (target && typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    onPaginationClick(event) {
      const link = event.target.closest('a.c-pagination__link');
      if (!link || !this.pagination.contains(link)) return;

      event.preventDefault();

      const url = new URL(link.href, window.location.origin);
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      window.history.pushState({ page }, '', `?page=${page}`);
      this.goToPage(page);
    }

    onPopState(event) {
      const page = (event.state && event.state.page) || this._readPageFromUrl();
      this.goToPage(page);
    }

    onRetry() {
      if (this.allItems) {
        this._renderPage(this.currentPage);
      } else {
        this.loadAll();
      }
    }

    onGoToFirstPage() {
      window.history.pushState({ page: 1 }, '', '?page=1');
      this.goToPage(1);
    }

    onErrorAction(event) {
      const btn = event.target.closest('button[data-article-list-action]');
      if (!btn || !this.errorEl.contains(btn)) return;
      const action = btn.dataset.articleListAction;
      if (action === 'retry') this.onRetry();
      else if (action === 'first') this.onGoToFirstPage();
    }

    init() {
      if (!this.container || !this.pagination) {
        console.error('[article-list] required DOM elements not found');
        return;
      }
      if (!this.listEndpoint) {
        console.error('[article-list] data-list-endpoint attribute is required');
        return;
      }

      window.history.replaceState(
        { page: this.currentPage },
        '',
        window.location.href
      );

      document.addEventListener('click', (ev) => {
        this.onPaginationClick(ev);
        this.onErrorAction(ev);
      });
      window.addEventListener('popstate', this.onPopState);

      this.loadAll();
    }
  }

  function boot() {
    const container = $(SELECTORS.container);
    if (!container) return;
    const controller = new ArticleListController(container);
    controller.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
