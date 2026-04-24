/**
 * Article Sidebar — generic client-side sidebar (ranking + categories + tags).
 *
 * Zero blog-specific logic. Config comes from data-* attributes on the
 * container rendered by azcom-article-sidebar-shell.mtml:
 *
 *   <div data-article-sidebar
 *        data-sidebar-endpoint="api/sidebar.json">
 *     ... skeleton placeholder ...
 *   </div>
 *
 * JSON shape expected:
 *   { ranking: [<item + rank>],
 *     categories: [{id,label,slug,url,count}],
 *     tags: [{id,name,url,count}] }
 *
 *   <item> is the MT Data API v1-compatible article shape:
 *     { id, title, basename, permalink, createdDate, categories:[label],
 *       tags:[name], blog:{id}, thumbnail, excerpt }
 *
 * Dependencies: api-client.js (global MTApiClient)
 */

(function () {
  'use strict';

  const CONTAINER_SELECTOR = '[data-article-sidebar]';

  const ERROR_MESSAGES = {
    network: '接続に失敗しました。',
    timeout: '読み込みに時間がかかっています。',
    http404: 'サイドバーが見つかりません。',
    http5xx: 'サーバーエラーが発生しました。',
    parse: 'データの読み込みに失敗しました。',
    unknown: 'サイドバーの読み込みに失敗しました。',
  };

  function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
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

  function classifyError(err) {
    if (!err) return { key: 'unknown', retriable: true };
    if (err.type === 'network') return { key: 'network', retriable: true };
    if (err.type === 'timeout') return { key: 'timeout', retriable: true };
    if (err.type === 'parse') return { key: 'parse', retriable: true };
    if (err.type === 'http') {
      if (err.status === 404) return { key: 'http404', retriable: false };
      if (err.status >= 500) return { key: 'http5xx', retriable: true };
    }
    return { key: 'unknown', retriable: true };
  }

  function buildRanking(ranking) {
    if (!ranking || ranking.length === 0) {
      return `
        <section class="c-article-sidebar__section">
          <h2 class="c-article-sidebar__section-title">閲覧ランキング</h2>
          <ul class="c-article-sidebar__ranking-list">
            <li class="c-article-sidebar__ranking-empty">
              <p>まだありません。</p>
            </li>
          </ul>
        </section>
      `;
    }

    const items = ranking
      .map((item) => {
        const thumb = item.thumbnail
          ? `<img src="${escapeHtml(item.thumbnail)}"
                  alt=""
                  width="145"
                  height="97"
                  loading="lazy">`
          : `<div class="c-article-sidebar__ranking-thumb-placeholder"></div>`;

        return `
          <li class="c-article-sidebar__ranking-item">
            <div class="c-article-sidebar__ranking-thumb" aria-hidden="true">
              ${thumb}
              <span class="c-article-sidebar__ranking-num" aria-label="${escapeHtml(item.rank)}位">
                ${escapeHtml(item.rank)}
              </span>
            </div>
            <a class="c-article-sidebar__ranking-body" href="${escapeHtml(item.permalink)}">
              <time class="c-article-sidebar__ranking-date" datetime="${escapeHtml(item.createdDate)}">
                ${escapeHtml(formatDisplayDate(item.createdDate))}
              </time>
              <span class="c-article-sidebar__ranking-title">${escapeHtml(item.title)}</span>
            </a>
          </li>
        `;
      })
      .join('');

    return `
      <section class="c-article-sidebar__section">
        <h2 class="c-article-sidebar__section-title">閲覧ランキング</h2>
        <ul class="c-article-sidebar__ranking-list">${items}</ul>
      </section>
    `;
  }

  function buildCategoriesAndTags(categories, tags) {
    const hasCats = Array.isArray(categories) && categories.length > 0;
    const hasTags = Array.isArray(tags) && tags.length > 0;
    if (!hasCats && !hasTags) return '';

    let inner = '';

    if (hasCats) {
      const cats = categories
        .map(
          (cat) => `
            <li class="c-article-sidebar__category-item">
              <a href="${escapeHtml(cat.url)}">${escapeHtml(cat.label)}</a>
            </li>`
        )
        .join('');
      inner += `
        <h3 class="c-article-sidebar__sub-title">カテゴリー一覧</h3>
        <ul class="c-article-sidebar__category-list">${cats}</ul>
      `;
    }

    if (hasTags) {
      const tagItems = tags
        .map(
          (tag) => `
            <li class="c-article-sidebar__tag-item">
              <a href="${escapeHtml(tag.url)}">${escapeHtml(tag.name)}</a>
            </li>`
        )
        .join('');
      inner += `
        <h3 class="c-article-sidebar__sub-title">タグ一覧</h3>
        <ul class="c-article-sidebar__tag-list">${tagItems}</ul>
      `;
    }

    return `
      <section class="c-article-sidebar__section">
        <h2 class="c-article-sidebar__section-title">カテゴリ / タグから探す</h2>
        ${inner}
      </section>
    `;
  }

  class ArticleSidebarController {
    constructor(container) {
      this.container = container;
      this.endpoint = container.dataset.sidebarEndpoint || '';
      this.apiClient = new MTApiClient();
      this.onClick = this.onClick.bind(this);
    }

    renderError(err) {
      const info = classifyError(err);
      const msg = ERROR_MESSAGES[info.key] || ERROR_MESSAGES.unknown;
      const retryBtn = info.retriable
        ? `<button type="button" class="c-button c-button--outline c-article-sidebar__retry"
                   data-article-sidebar-action="retry">再試行</button>`
        : '';
      this.container.innerHTML = `
        <div class="c-article-sidebar__error" role="alert">
          <p class="c-article-sidebar__error-message">${escapeHtml(msg)}</p>
          ${retryBtn}
        </div>
      `;
    }

    renderSkeleton() {
      this.container.innerHTML = `
        <div class="c-skeleton c-skeleton--sidebar" aria-hidden="true">
          <div class="c-article-sidebar__section">
            <div class="c-skeleton__section-title"></div>
            ${Array.from({ length: 3 })
              .map(
                () => `
                  <div class="c-skeleton__ranking-item">
                    <div class="c-skeleton__thumb c-skeleton__thumb--sm"></div>
                    <div class="c-skeleton__ranking-body">
                      <div class="c-skeleton__line c-skeleton__line--short"></div>
                      <div class="c-skeleton__line"></div>
                      <div class="c-skeleton__line"></div>
                    </div>
                  </div>`
              )
              .join('')}
          </div>
          <div class="c-article-sidebar__section">
            <div class="c-skeleton__section-title"></div>
            <div class="c-skeleton__pill-group">
              ${Array.from({ length: 6 }).map(() => `<span class="c-skeleton__pill"></span>`).join('')}
            </div>
          </div>
        </div>
      `;
    }

    async load() {
      this.renderSkeleton();
      let data;
      try {
        data = await this.apiClient.getWithRetry(this.endpoint, { retries: 2 });
      } catch (err) {
        console.error('[article-sidebar] load failed:', err);
        this.renderError(err);
        return;
      }

      const html = `
        <aside class="c-article-sidebar" aria-label="サイドメニュー">
          ${buildRanking(data.ranking)}
          ${buildCategoriesAndTags(data.categories, data.tags)}
        </aside>
      `;
      this.container.innerHTML = html;
    }

    onClick(event) {
      const btn = event.target.closest('button[data-article-sidebar-action]');
      if (!btn || !this.container.contains(btn)) return;
      if (btn.dataset.articleSidebarAction === 'retry') {
        this.load();
      }
    }

    init() {
      if (!this.endpoint) {
        console.error('[article-sidebar] data-sidebar-endpoint is required');
        return;
      }
      this.container.addEventListener('click', this.onClick);
      this.load();
    }
  }

  function boot() {
    const container = document.querySelector(CONTAINER_SELECTOR);
    if (!container) return;
    const controller = new ArticleSidebarController(container);
    controller.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
