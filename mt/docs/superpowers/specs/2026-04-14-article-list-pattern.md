# Article List Pattern — Generic CSR Shell

**Status:** Implemented
**Date:** 2026-04-14
**Scope:** News blog (first consumer), reusable for any `/blog/*/index.mtml`

Cross-blog client-side rendering pattern for article list + sidebar screens,
backed by MT-generated JSON APIs. Replaces the former `news-list.js` /
`news-sidebar.js` blog-specific implementation.

---

## 1. Goals

- Zero blog-specific logic in JS — all config passed via MTML vars → `data-*` attrs.
- Single source of truth for list/sidebar UI: one JS file each, one MTML shell each.
- Identical code between **local** (`development-dev`) and **cloud** (`development-cloud`);
  only `env_has_cf` differs between environments (handled by API layer, not UI).
- Pulse skeleton loading (no text placeholders).
- Classified error handling with retry, not a single generic message.

## 2. Architecture

```
                     ┌────────────────────────────┐
                     │  blog/*/index.mtml          │
                     │  (sets vars, includes       │
                     │   shells, loads JS)         │
                     └────────────┬────────────────┘
                                  │ <mt:Include>
                ┌─────────────────┴─────────────────┐
                │                                   │
    ┌───────────▼───────────┐         ┌─────────────▼────────────┐
    │ azcom-article-list-    │         │ azcom-article-sidebar-   │
    │ shell.mtml             │         │ shell.mtml               │
    │ (skeleton + data-*)    │         │ (skeleton + data-*)      │
    └───────────┬───────────┘         └─────────────┬────────────┘
                │                                   │
                │ read data-* attrs                 │
                │                                   │
    ┌───────────▼───────────┐         ┌─────────────▼────────────┐
    │ article-list.js        │         │ article-sidebar.js       │
    │ (generic controller)   │         │ (generic controller)     │
    └───────────┬───────────┘         └─────────────┬────────────┘
                │                                   │
                └────────────────┬──────────────────┘
                                 │ uses
                        ┌────────▼─────────┐
                        │ api-client.js    │
                        │ (fetch + retry)  │
                        └────────┬─────────┘
                                 │
                        ┌────────▼─────────┐
                        │ JSON API         │
                        │ /api/*.json      │
                        └──────────────────┘
```

## 3. File inventory

### JavaScript (generic, blog-agnostic)

| File | Purpose |
|---|---|
| `assets/js/api-client.js` | `MTApiClient` — fetch, timeout (10s), retry (2 attempts, exponential backoff), classified errors |
| `assets/js/article-list.js` | `ArticleListController` — grid + pagination + URL state + error retry |
| `assets/js/article-sidebar.js` | `ArticleSidebarController` — ranking + categories + tags + error retry |

All mirrored to `development-dev/assets/js/`.

### CSS

| File | Purpose |
|---|---|
| `assets/css/skeleton.css` | Pulse animation, card/sidebar/pill placeholders, `prefers-reduced-motion` support |
| `assets/css/article-card.css` | Existing — article card styling |
| `assets/css/article-sidebar.css` | Existing + error state styles |
| `assets/css/article-page.css` | Existing + error state styles |

All mirrored to `development-dev/assets/css/`.

### MTML shells (Website-level Template Modules)

| Module | Location |
|---|---|
| `azcom-article-list-shell` | `development-dev` + `development-cloud` under `templates/components/article/` |
| `azcom-article-sidebar-shell` | same |

JSON API templates remain unchanged (`api-news-list`, `api-sidebar`, etc.).

## 4. Shell contracts

### `azcom-article-list-shell.mtml`

Caller sets:

| Var | Required | Example |
|---|---|---|
| `article_list_endpoint` | yes | `api/news-list.json` |
| `article_list_page_pattern` | yes | `api/news-list/page/{page}.json` |
| `article_list_empty_message` | yes | `お知らせはまだありません。` |
| `article_list_scroll_target` | no (default `#main`) | `#main` |
| `article_list_skeleton_count` | no (default `6`) | `6` |

Renders: `#article-list-skeleton`, `#article-list-container[data-article-list]`,
`#article-list-empty`, `#article-list-error`, `#article-list-pagination`.

### `azcom-article-sidebar-shell.mtml`

Caller sets:

| Var | Required | Example |
|---|---|---|
| `article_sidebar_endpoint` | yes | `api/sidebar.json` |

Renders: `#article-sidebar-container[data-article-sidebar]` with embedded skeleton.

## 5. Error handling

`api-client.js` returns classified errors:

```
{ type: 'network'|'timeout'|'http'|'parse'|'abort', status, message }
```

Retry is automatic (up to 2 times, exponential backoff 500ms/1000ms) for:
`network`, `timeout`, `http` with `status >= 500`.

After retries exhausted, UI renders with appropriate message + action button:

| Error key | Message | Action |
|---|---|---|
| `network` | 接続に失敗しました。ネットワークをご確認ください。 | 再試行 |
| `timeout` | 読み込みに時間がかかっています。もう一度お試しください。 | 再試行 |
| `http404` | ページが見つかりません。 | 1ページ目へ戻る |
| `http5xx` | サーバーエラーが発生しました。しばらくしてから再度お試しください。 | 再試行 |
| `parse` | データの読み込みに失敗しました。 | 再試行 |
| `unknown` | 記事の読み込みに失敗しました。 | 再試行 |

## 6. Reuse for another blog

Example: add this pattern to a `recruit` blog.

**Step 1.** Create JSON API templates in the `recruit` blog (mirror the news pattern):
`api-recruit-list` (Index), `api-recruit-detail` (Entry Archive), optional
`api-sidebar` (Index).

**Step 2.** Create `blog/recruit/index.mtml`:

```mtml
<mt:Include module="azcom-env-config">
<meta name="site-root" content="<$mt:BlogRelativeURL$>">

<link rel="stylesheet" href=".../skeleton.css">
<link rel="stylesheet" href=".../article-card.css">
<link rel="stylesheet" href=".../article-sidebar.css">
<link rel="stylesheet" href=".../article-page.css">
<link rel="stylesheet" href=".../pagination.css">

...

<div class="p-article-list__main">
  <mt:SetVar name="article_list_endpoint" value="api/recruit-list.json">
  <mt:SetVar name="article_list_page_pattern" value="api/recruit-list/page/{page}.json">
  <mt:SetVarBlock name="article_list_empty_message">求人情報はまだありません。</mt:SetVarBlock>
  <mt:Include module="azcom-article-list-shell">
</div>

<div class="p-article-list__sidebar">
  <mt:SetVar name="article_sidebar_endpoint" value="api/sidebar.json">
  <mt:Include module="azcom-article-sidebar-shell">
</div>

<script src=".../api-client.js"></script>
<script defer src=".../article-list.js"></script>
<script defer src=".../article-sidebar.js"></script>
```

Zero JS changes required. No new JS files per blog.

## 7. Local vs Cloud

| Aspect | Local (`development-dev`) | Cloud (`development-cloud`) |
|---|---|---|
| `env_has_cf` | `0` | `1` |
| CSS/JS | identical | identical |
| MTML shells | identical | identical |
| `blog/news/index.mtml` | identical (except `subpage_hero_bg`) | identical pattern |
| JSON API ranking | PHASE 2 fallback (newest 5) | PHASE 1 (CF-driven) then fallback |
| Blog root URL | `/renew/news/` | `/news/` |
| Site-root auto-detect | via `<meta name="site-root">` → `<$mt:BlogRelativeURL$>` | idem |

JS never hard-codes paths — everything resolves through the meta tag + data-attrs.

## 8. Phase 2: SEO / SSR (future, not in scope here)

The current pattern is CSR-only. For SEO-sensitive screens we have three
graduated options when needed:

- **Option A — `<noscript>` fallback.** Render top-N articles server-side
  inside `<noscript>` using existing MTML query modules. Quickest win,
  minimal SEO (no pagination crawl), zero runtime cost for JS-enabled users.
- **Option B — Dual render.** MTML renders page 1 statically, JS takes over
  for page 2+ (similar to MT doc `pagination-static.html` but avoiding
  `mt-search.cgi`). Preserves all existing filtering accuracy.
- **Option C — Edge SSR proxy.** A runtime proxy in front of static files
  that pre-renders the grid from the JSON API. Highest SEO, highest ops
  complexity.

Recommended trajectory: start with Option A if/when SEO becomes a requirement.
Option B is the natural upgrade path; Option C reserved for high-traffic
public-facing catalogues.

## 9. Admin setup (one-time)

Add **2 Template Modules at Website level**:

1. `azcom-article-list-shell` — paste body from
   `development-cloud/templates/components/article/azcom-article-list-shell.mtml`
2. `azcom-article-sidebar-shell` — paste body from
   `development-cloud/templates/components/article/azcom-article-sidebar-shell.mtml`

No new `CustomField` / `ContentType`. Existing JSON API templates remain as-is.

## 10. Validation checklist

- [ ] Skeleton visible on initial load, hides when data arrives
- [ ] Empty state shown when `articles` is `[]`
- [ ] Error shown with correct message per classification
- [ ] Retry button re-fetches the current page
- [ ] `1ページ目へ戻る` button resets to `?page=1`
- [ ] Pagination click updates URL without full reload
- [ ] Browser back/forward replays the right page
- [ ] `<meta name="site-root">` drives all URL resolution
- [ ] Works on `/renew/news/` (local) and `/news/` (cloud)
- [ ] `prefers-reduced-motion: reduce` disables pulse animation
- [ ] No remaining references to `news-list.js` or `news-sidebar.js` in source
- [ ] `development-dev/assets/` mirrors `assets/`
