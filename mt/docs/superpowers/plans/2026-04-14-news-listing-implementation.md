# News Listing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the News section (list / category / tag / detail) for AZ-COM corporate site with shared sidebar, using cross-blog reusable MTML modules and CSS components.

**Architecture:** Approach C — modular MTML components named `azcom-article-*` (cross-blog reusable), CSS split by concern into `article-card.css`, `article-sidebar.css`, `article-page.css`, `pagination.css`, `article-content.css`. MT native static pagination. Corporate display filter + azcom-newsletter exclusion applied consistently via shared query module.

**Tech Stack:** Movable Type 8.x MTML, CSS custom properties (design tokens from `base.css`), static HTML generation

**Spec:** `docs/superpowers/specs/2026-04-14-news-listing-design.md`

---

## File Map

### New files to create
| File | Responsibility |
|---|---|
| `assets/css/article-card.css` | `.c-article-card` component styles |
| `assets/css/article-sidebar.css` | `.c-article-sidebar` component styles |
| `assets/css/article-page.css` | Page layout shells (list + detail) |
| `assets/css/pagination.css` | `.c-pagination` global component |
| `assets/css/article-content.css` | `.mt-content` article body styles |
| `development-dev/assets/css/article-card.css` | Mirror |
| `development-dev/assets/css/article-sidebar.css` | Mirror |
| `development-dev/assets/css/article-page.css` | Mirror |
| `development-dev/assets/css/pagination.css` | Mirror |
| `development-dev/assets/css/article-content.css` | Mirror |
| `development-dev/templates/components/article/azcom-article-card.mtml` | Card component |
| `development-dev/templates/components/article/azcom-article-query-corporate.mtml` | Corporate filter query module |
| `development-dev/templates/components/article/azcom-article-sidebar-ranking.mtml` | Ranking list |
| `development-dev/templates/components/article/azcom-article-sidebar.mtml` | Sidebar wrapper |
| `development-dev/templates/components/article/azcom-article-prev-next.mtml` | Prev/next navigation |
| `development-dev/templates/components/shared/azcom-pagination.mtml` | Global pagination |
| `development-dev/blog/news/category.mtml` | Category list page |
| `development-dev/blog/news/tag.mtml` | Tag list page |
| `development-dev/blog/news/detail.mtml` | Article detail page |

### Files to modify
| File | Change |
|---|---|
| `development-dev/blog/news/index.mtml` | Replace placeholder `<div style="height:100vh">` with actual content |
| `assets/css/news.css` | Add page-specific overrides if needed (likely stays minimal) |
| `development-dev/assets/css/news.css` | Mirror |

---

## Task 1: Pagination CSS + MTML Component

**Reason first:** Pagination is the most reusable global component (used by search later). Build it in isolation.

**Files:**
- Create: `assets/css/pagination.css`
- Create: `development-dev/assets/css/pagination.css` (mirror)
- Create: `development-dev/templates/components/shared/azcom-pagination.mtml`

- [ ] **Step 1.1: Create `assets/css/pagination.css`**

```css
/* ==========================================================================
   Pagination — global component reused by article lists and search
   ========================================================================== */

.c-pagination {
  display: flex;
  justify-content: center;
  margin-block-start: var(--space-2xl);
}

.c-pagination__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-xs);
  list-style: none;
  margin: 0;
  padding: 0;
}

.c-pagination__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding-inline: var(--space-sm);
  font-family: var(--font-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  color: var(--color-text-primary);
  text-decoration: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition:
    background-color var(--duration-normal) var(--easing-default),
    color var(--duration-normal) var(--easing-default),
    border-color var(--duration-normal) var(--easing-default);
}

.c-pagination__link:hover {
  background-color: var(--color-primary-light);
  border-color: var(--color-primary-light-2);
  color: var(--color-primary);
}

.c-pagination__link--active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-white);
  pointer-events: none;
}

.c-pagination__link--active:hover {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.c-pagination__link--disabled {
  opacity: 0.4;
  pointer-events: none;
  cursor: default;
}

.c-pagination__link--prev,
.c-pagination__link--next {
  gap: var(--space-xs);
  padding-inline: var(--space-md);
}

@media (max-width: 767px) {
  .c-pagination {
    margin-block-start: var(--space-xl);
  }

  .c-pagination__link {
    min-width: 36px;
    height: 36px;
    font-size: var(--font-size-xs);
  }

  .c-pagination__link--prev,
  .c-pagination__link--next {
    padding-inline: var(--space-sm);
  }
}
```

- [ ] **Step 1.2: Create `development-dev/templates/components/shared/azcom-pagination.mtml`**

```mtml
<mt:Ignore>
  Global pagination component — used by article list pages and future search page.
  Must be called inside <mt:PagerBlock> context.
  Renders: prev / page numbers / next
  CSS: pagination.css (.c-pagination)
</mt:Ignore>

<nav class="c-pagination" aria-label="ページナビゲーション">
  <ul class="c-pagination__list">

    <mt:PagerBlock>

      <mt:If name="__first__">
        <li class="c-pagination__item">
          <mt:If name="__odd__">
          <mt:Else>
          </mt:If>
        </li>
      </mt:If>

      <mt:If tag="PagerLink">
        <li class="c-pagination__item">
          <a class="c-pagination__link<mt:If tag="PagerCurrentPage"> c-pagination__link--active</mt:If>"
             href="<$mt:PagerLink$>"
             <mt:If tag="PagerCurrentPage">aria-current="page"</mt:If>>
            <$mt:PagerCurrentPage$><mt:Unless tag="PagerCurrentPage"><$mt:PagerLink$></mt:Unless>
          </a>
        </li>
      </mt:If>

    </mt:PagerBlock>

  </ul>
</nav>
```

> **Note:** MT's `<mt:PagerBlock>` generates the pagination context. Use `<$mt:PagerLink$>` for page URLs, `<$mt:PagerCurrentPage$>` for the active page number. Prev/next are handled via `<mt:IfPreviousResults>` / `<mt:IfMoreResults>` — see Step 1.3 for the corrected full version.

- [ ] **Step 1.3: Replace with correct MT pagination MTML**

MT pagination uses different tags. Replace `azcom-pagination.mtml` with:

```mtml
<mt:Ignore>
  Global pagination component.
  Call inside an <mt:Entries> or archive context that supports pagination.
  CSS: pagination.css (.c-pagination)
</mt:Ignore>

<nav class="c-pagination" aria-label="ページナビゲーション">
  <ul class="c-pagination__list">

    <mt:IfPreviousResults>
      <li class="c-pagination__item">
        <a class="c-pagination__link c-pagination__link--prev"
           href="<$mt:PreviousLink$>"
           rel="prev">&#8592; 前へ</a>
      </li>
    <mt:Else>
      <li class="c-pagination__item">
        <span class="c-pagination__link c-pagination__link--prev c-pagination__link--disabled"
              aria-disabled="true">&#8592; 前へ</span>
      </li>
    </mt:IfPreviousResults>

    <mt:PagerBlock>
      <li class="c-pagination__item">
        <mt:If name="__value__" eq="$pager_current_page">
          <span class="c-pagination__link c-pagination__link--active"
                aria-current="page"><$mt:Var name="__value__"$></span>
        <mt:Else>
          <a class="c-pagination__link"
             href="<$mt:PagerLink$>"><$mt:Var name="__value__"$></a>
        </mt:If>
      </li>
    </mt:PagerBlock>

    <mt:IfMoreResults>
      <li class="c-pagination__item">
        <a class="c-pagination__link c-pagination__link--next"
           href="<$mt:NextLink$>"
           rel="next">次へ &#8594;</a>
      </li>
    <mt:Else>
      <li class="c-pagination__item">
        <span class="c-pagination__link c-pagination__link--next c-pagination__link--disabled"
              aria-disabled="true">次へ &#8594;</span>
      </li>
    </mt:IfMoreResults>

  </ul>
</nav>
```

- [ ] **Step 1.4: Mirror CSS to development-dev**

```bash
cp assets/css/pagination.css development-dev/assets/css/pagination.css
```

- [ ] **Step 1.5: Commit**

```bash
cd /Users/macbook_280/Downloads/movabletype/mt
git add assets/css/pagination.css \
        development-dev/assets/css/pagination.css \
        development-dev/templates/components/shared/azcom-pagination.mtml
git commit -m "feat: add global pagination component (CSS + MTML)"
```

---

## Task 2: Article Card CSS + MTML Component

**Files:**
- Create: `assets/css/article-card.css`
- Create: `development-dev/assets/css/article-card.css` (mirror)
- Create: `development-dev/templates/components/article/azcom-article-card.mtml`

- [ ] **Step 2.1: Create article components directory**

```bash
mkdir -p development-dev/templates/components/article
```

- [ ] **Step 2.2: Create `assets/css/article-card.css`**

```css
/* ==========================================================================
   Article Card — cross-blog reusable component
   ========================================================================== */

.c-article-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
}

.c-article-card {
  display: flex;
  flex-direction: column;
  background-color: var(--color-white);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  text-decoration: none;
  color: inherit;
  transition:
    box-shadow var(--duration-normal) var(--easing-default),
    transform var(--duration-normal) var(--easing-default);
}

.c-article-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* Thumbnail
========================================================================== */

.c-article-card__thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: var(--color-primary-light);
  flex-shrink: 0;
}

.c-article-card__thumb-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--duration-slow) var(--easing-default);
}

.c-article-card:hover .c-article-card__thumb-img {
  transform: scale(1.04);
}

.c-article-card__thumb-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom right,
    var(--color-primary-light),
    var(--color-primary-light-2)
  );
}

/* Body
========================================================================== */

.c-article-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
  flex: 1;
}

.c-article-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.c-article-card__date {
  font-family: var(--font-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-small);
  color: var(--color-text-secondary);
}

.c-article-card__category {
  display: inline-block;
  padding: 2px var(--space-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-small);
  color: var(--color-primary);
  background-color: var(--color-primary-light);
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.c-article-card__title {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-heading);
  color: var(--color-text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.c-article-card:hover .c-article-card__title {
  color: var(--color-primary);
}

/* Modifier: no thumbnail (future use — search results)
========================================================================== */

.c-article-card--no-thumb .c-article-card__thumb {
  display: none;
}

/* Mobile
========================================================================== */

@media (max-width: 767px) {
  .c-article-grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }

  .c-article-card__body {
    padding: var(--space-sm) var(--space-md) var(--space-md);
  }

  .c-article-card__title {
    font-size: var(--font-size-sm);
    -webkit-line-clamp: 2;
  }
}
```

- [ ] **Step 2.3: Create `development-dev/templates/components/article/azcom-article-card.mtml`**

```mtml
<mt:Ignore>
  Article card component — cross-blog reusable.
  Must be called inside an <mt:Entries> loop context.
  Renders: thumbnail (with placeholder fallback), date, primary category, title.
  Links to: /{section}/post_{EntryID}/
  CSS: article-card.css (.c-article-card)

  Caller must set before include:
    article_card_section — e.g. "news" (used to build URL)
</mt:Ignore>

<a class="c-article-card"
   href="/<$mt:Var name="article_card_section" encode_html="1"$>/post_<$mt:EntryID encode_html="1"$>/"
   aria-label="<$mt:EntryTitle remove_html="1" encode_html="1"$>">

  <div class="c-article-card__thumb" aria-hidden="true">
    <mt:If tag="EntryCustomField basename='thumbnail'" ne="">
      <img class="c-article-card__thumb-img"
           src="<$mt:EntryCustomField basename='thumbnail' encode_html='1'$>"
           alt=""
           width="400"
           height="225"
           loading="lazy">
    <mt:Else>
      <div class="c-article-card__thumb-placeholder"></div>
    </mt:If>
  </div>

  <div class="c-article-card__body">
    <div class="c-article-card__meta">
      <time class="c-article-card__date"
            datetime="<$mt:EntryDate format_name='iso8601'$>">
        <$mt:EntryDate format="%Y.%m.%d"$>
      </time>
      <mt:EntryCategories glue="">
        <mt:If tag="CategoryParentCategory">
          <span class="c-article-card__category">
            <$mt:CategoryLabel encode_html="1"$>
          </span>
        </mt:If>
      </mt:EntryCategories>
    </div>
    <h3 class="c-article-card__title">
      <$mt:EntryTitle remove_html="1" encode_html="1"$>
    </h3>
  </div>

</a>
```

- [ ] **Step 2.4: Mirror CSS**

```bash
cp assets/css/article-card.css development-dev/assets/css/article-card.css
```

- [ ] **Step 2.5: Commit**

```bash
git add assets/css/article-card.css \
        development-dev/assets/css/article-card.css \
        development-dev/templates/components/article/azcom-article-card.mtml
git commit -m "feat: add article card component (CSS + MTML)"
```

---

## Task 3: Corporate Filter Query Module

**Files:**
- Create: `development-dev/templates/components/article/azcom-article-query-corporate.mtml`

- [ ] **Step 3.1: Create `azcom-article-query-corporate.mtml`**

```mtml
<mt:Ignore>
  Corporate filter query module — cross-blog reusable.
  Scans entries and renders filtered .c-article-card items for the corporate site.

  Rules applied:
    1. Exclude category basename "azcom-newsletter" (member-only content)
    2. Include display_target = "corporate" | "both" | "" (backward-compat)
    3. Skip display_target check entirely for blogs without it (e.g. supplier)

  Caller must set BEFORE include:
    article_query_limit          — max cards to render (e.g. 10)
    article_query_lastn          — pool to scan (default 300; set higher if needed)
    article_has_display_target   — 1 = apply display_target filter (news/activity/support)
                                   0 = skip filter (supplier)
    article_card_section         — section slug for URLs (e.g. "news")

  Outputs:
    article_count                — integer: number of cards rendered
    HTML: .c-article-card items (no wrapper — caller provides .c-article-grid)
</mt:Ignore>

<mt:SetVar name="article_count" value="0">

<mt:Entries lastn="$article_query_lastn" sort_by="authored_on" sort_order="descend">
  <mt:If name="article_count" lt="$article_query_limit">

    <mt:SetVar name="is_newsletter" value="0">
    <mt:EntryCategories>
      <mt:If tag="CategoryBasename" eq="azcom-newsletter">
        <mt:SetVar name="is_newsletter" value="1">
      </mt:If>
    </mt:EntryCategories>

    <mt:SetVar name="is_corp_target" value="0">
    <mt:If name="article_has_display_target" eq="0">
      <mt:SetVar name="is_corp_target" value="1">
    <mt:Else>
      <mt:If tag="EntryCustomField basename='display_target'" eq="corporate">
        <mt:SetVar name="is_corp_target" value="1">
      </mt:If>
      <mt:If tag="EntryCustomField basename='display_target'" eq="both">
        <mt:SetVar name="is_corp_target" value="1">
      </mt:If>
      <mt:If tag="EntryCustomField basename='display_target'" eq="">
        <mt:SetVar name="is_corp_target" value="1">
      </mt:If>
    </mt:If>

    <mt:If name="is_newsletter" eq="0">
      <mt:If name="is_corp_target" eq="1">
        <mt:Include module="azcom-article-card">
        <mt:SetVar name="article_count" op="++">
      </mt:If>
    </mt:If>

  </mt:If>
</mt:Entries>

<mt:If name="article_count" eq="0">
  <p class="p-article-list__empty" role="status">お知らせはまだありません。</p>
</mt:If>
```

- [ ] **Step 3.2: Commit**

```bash
git add development-dev/templates/components/article/azcom-article-query-corporate.mtml
git commit -m "feat: add corporate filter query module"
```

---

## Task 4: Sidebar Ranking Module

**Files:**
- Create: `development-dev/templates/components/article/azcom-article-sidebar-ranking.mtml`

- [ ] **Step 4.1: Create `azcom-article-sidebar-ranking.mtml`**

```mtml
<mt:Ignore>
  Sidebar ranking module — cross-blog reusable.
  Displays up to 5 articles flagged ranking_enabled=1.
  Falls back to non-ranking articles if fewer than 5 ranking entries exist.

  Caller must set BEFORE include:
    sidebar_section                — "news" / "activity-report" / etc.
    sidebar_has_display_target     — 1 or 0 (same as article_has_display_target)
    article_query_lastn            — pool to scan (default 300)

  CSS: article-sidebar.css (.c-article-sidebar__ranking-*)
</mt:Ignore>

<mt:SetVar name="rank_count" value="0">
<mt:SetVar name="rank_ids_rendered" value="">

<mt:Ignore>— PHASE 1: ranking_enabled = 1 —</mt:Ignore>
<mt:Entries lastn="$article_query_lastn" sort_by="authored_on" sort_order="descend">
  <mt:If name="rank_count" lt="5">

    <mt:SetVar name="is_newsletter" value="0">
    <mt:EntryCategories>
      <mt:If tag="CategoryBasename" eq="azcom-newsletter">
        <mt:SetVar name="is_newsletter" value="1">
      </mt:If>
    </mt:EntryCategories>

    <mt:SetVar name="is_corp_target" value="0">
    <mt:If name="sidebar_has_display_target" eq="0">
      <mt:SetVar name="is_corp_target" value="1">
    <mt:Else>
      <mt:If tag="EntryCustomField basename='display_target'" eq="corporate">
        <mt:SetVar name="is_corp_target" value="1">
      </mt:If>
      <mt:If tag="EntryCustomField basename='display_target'" eq="both">
        <mt:SetVar name="is_corp_target" value="1">
      </mt:If>
      <mt:If tag="EntryCustomField basename='display_target'" eq="">
        <mt:SetVar name="is_corp_target" value="1">
      </mt:If>
    </mt:If>

    <mt:If tag="EntryCustomField basename='ranking_enabled'" eq="1">
      <mt:If name="is_newsletter" eq="0">
        <mt:If name="is_corp_target" eq="1">

          <mt:SetVar name="rank_count" op="++">
          <mt:SetVar name="rank_ids_rendered" value="$rank_ids_rendered,<$mt:EntryID$>,">

          <li class="c-article-sidebar__ranking-item">
            <span class="c-article-sidebar__ranking-num" aria-label="<$mt:Var name='rank_count'$>位">
              <$mt:Var name="rank_count"$>
            </span>
            <div class="c-article-sidebar__ranking-thumb" aria-hidden="true">
              <mt:If tag="EntryCustomField basename='thumbnail'" ne="">
                <img src="<$mt:EntryCustomField basename='thumbnail' encode_html='1'$>"
                     alt=""
                     width="80" height="56" loading="lazy">
              <mt:Else>
                <div class="c-article-sidebar__ranking-thumb-placeholder"></div>
              </mt:If>
            </div>
            <a class="c-article-sidebar__ranking-title"
               href="/<$mt:Var name='sidebar_section' encode_html='1'$>/post_<$mt:EntryID encode_html='1'$>/">
              <$mt:EntryTitle remove_html="1" encode_html="1"$>
            </a>
          </li>

        </mt:If>
      </mt:If>
    </mt:If>

  </mt:If>
</mt:Entries>

<mt:Ignore>— PHASE 2: fallback — fill to 5 with non-ranking entries —</mt:Ignore>
<mt:If name="rank_count" lt="5">
<mt:Entries lastn="$article_query_lastn" sort_by="authored_on" sort_order="descend">
  <mt:If name="rank_count" lt="5">

    <mt:SetVar name="is_newsletter" value="0">
    <mt:EntryCategories>
      <mt:If tag="CategoryBasename" eq="azcom-newsletter">
        <mt:SetVar name="is_newsletter" value="1">
      </mt:If>
    </mt:EntryCategories>

    <mt:SetVar name="is_corp_target" value="0">
    <mt:If name="sidebar_has_display_target" eq="0">
      <mt:SetVar name="is_corp_target" value="1">
    <mt:Else>
      <mt:If tag="EntryCustomField basename='display_target'" eq="corporate">
        <mt:SetVar name="is_corp_target" value="1">
      </mt:If>
      <mt:If tag="EntryCustomField basename='display_target'" eq="both">
        <mt:SetVar name="is_corp_target" value="1">
      </mt:If>
      <mt:If tag="EntryCustomField basename='display_target'" eq="">
        <mt:SetVar name="is_corp_target" value="1">
      </mt:If>
    </mt:If>

    <mt:SetVar name="already_rendered" value="0">
    <mt:If name="rank_ids_rendered" like="*,<$mt:EntryID$>,*">
      <mt:SetVar name="already_rendered" value="1">
    </mt:If>

    <mt:Unless tag="EntryCustomField basename='ranking_enabled'" eq="1">
      <mt:If name="is_newsletter" eq="0">
        <mt:If name="is_corp_target" eq="1">
          <mt:If name="already_rendered" eq="0">

            <mt:SetVar name="rank_count" op="++">

            <li class="c-article-sidebar__ranking-item">
              <span class="c-article-sidebar__ranking-num" aria-label="<$mt:Var name='rank_count'$>位">
                <$mt:Var name="rank_count"$>
              </span>
              <div class="c-article-sidebar__ranking-thumb" aria-hidden="true">
                <mt:If tag="EntryCustomField basename='thumbnail'" ne="">
                  <img src="<$mt:EntryCustomField basename='thumbnail' encode_html='1'$>"
                       alt=""
                       width="80" height="56" loading="lazy">
                <mt:Else>
                  <div class="c-article-sidebar__ranking-thumb-placeholder"></div>
                </mt:If>
              </div>
              <a class="c-article-sidebar__ranking-title"
                 href="/<$mt:Var name='sidebar_section' encode_html='1'$>/post_<$mt:EntryID encode_html='1'$>/">
                <$mt:EntryTitle remove_html="1" encode_html="1"$>
              </a>
            </li>

          </mt:If>
        </mt:If>
      </mt:If>
    </mt:Unless>

  </mt:If>
</mt:Entries>
</mt:If>
```

- [ ] **Step 4.2: Commit**

```bash
git add development-dev/templates/components/article/azcom-article-sidebar-ranking.mtml
git commit -m "feat: add sidebar ranking module (phase1 + fallback)"
```

---

## Task 5: Sidebar Wrapper Module + CSS

**Files:**
- Create: `assets/css/article-sidebar.css`
- Create: `development-dev/assets/css/article-sidebar.css` (mirror)
- Create: `development-dev/templates/components/article/azcom-article-sidebar.mtml`

- [ ] **Step 5.1: Create `assets/css/article-sidebar.css`**

```css
/* ==========================================================================
   Article Sidebar — cross-blog reusable
   ========================================================================== */

.c-article-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

/* Section block (ranking / category / tag)
========================================================================== */

.c-article-sidebar__section {
  background-color: var(--color-white);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.c-article-sidebar__section-title {
  margin: 0 0 var(--space-md);
  padding-bottom: var(--space-sm);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-heading);
  color: var(--color-primary-dark);
  border-bottom: 2px solid var(--color-primary-light-2);
}

/* Ranking list
========================================================================== */

.c-article-sidebar__ranking-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.c-article-sidebar__ranking-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
}

.c-article-sidebar__ranking-num {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-family: var(--font-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  line-height: 1;
  color: var(--color-white);
  background-color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
}

.c-article-sidebar__ranking-item:first-child .c-article-sidebar__ranking-num {
  background-color: var(--color-accent);
}

.c-article-sidebar__ranking-thumb {
  flex-shrink: 0;
  width: 72px;
  height: 50px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background-color: var(--color-primary-light);
}

.c-article-sidebar__ranking-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.c-article-sidebar__ranking-thumb-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom right,
    var(--color-primary-light),
    var(--color-primary-light-2)
  );
}

.c-article-sidebar__ranking-title {
  flex: 1;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-heading);
  color: var(--color-text-primary);
  text-decoration: none;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.c-article-sidebar__ranking-title:hover {
  color: var(--color-primary);
}

/* Category list
========================================================================== */

.c-article-sidebar__category-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.c-article-sidebar__category-item a {
  display: inline-block;
  padding: 4px var(--space-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-small);
  color: var(--color-primary);
  background-color: var(--color-primary-light);
  border: 1px solid var(--color-primary-light-2);
  border-radius: var(--radius-pill);
  text-decoration: none;
  transition:
    background-color var(--duration-normal) var(--easing-default),
    color var(--duration-normal) var(--easing-default);
}

.c-article-sidebar__category-item a:hover {
  background-color: var(--color-primary);
  color: var(--color-white);
  border-color: var(--color-primary);
}

/* Tag list
========================================================================== */

.c-article-sidebar__tag-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.c-article-sidebar__tag-item a {
  display: inline-block;
  padding: 4px var(--space-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-small);
  color: var(--color-text-secondary);
  background-color: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition:
    background-color var(--duration-normal) var(--easing-default),
    color var(--duration-normal) var(--easing-default),
    border-color var(--duration-normal) var(--easing-default);
}

.c-article-sidebar__tag-item a:hover {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border-color: var(--color-primary-light-2);
}

/* Mobile — sidebar renders below main content (no structural change needed,
   handled by article-page.css flex-direction: column on SP)
========================================================================== */

@media (max-width: 767px) {
  .c-article-sidebar__section {
    padding: var(--space-md);
  }
}
```

- [ ] **Step 5.2: Create `azcom-article-sidebar.mtml`**

```mtml
<mt:Ignore>
  Sidebar wrapper — cross-blog reusable.
  Renders: Ranking, Category list (child only), Tag list (all).

  Caller must set BEFORE include:
    sidebar_section                — "news" (used in ranking URLs + tag URLs)
    sidebar_has_display_target     — 1 (news/activity/support) | 0 (supplier)
    article_query_lastn            — pool size for ranking scan (default 300)

  CSS: article-sidebar.css (.c-article-sidebar)
</mt:Ignore>

<aside class="c-article-sidebar" aria-label="サイドメニュー">

  <mt:Ignore>— Ranking —</mt:Ignore>
  <section class="c-article-sidebar__section">
    <h2 class="c-article-sidebar__section-title">閲覧ランキング</h2>
    <ul class="c-article-sidebar__ranking-list">
      <mt:Include module="azcom-article-sidebar-ranking">
    </ul>
  </section>

  <mt:Ignore>— Category list (child categories only, exclude azcom-newsletter) —</mt:Ignore>
  <section class="c-article-sidebar__section">
    <h2 class="c-article-sidebar__section-title">カテゴリ / タグから探す</h2>

    <mt:SetVar name="has_child_category" value="0">
    <mt:Categories>
      <mt:If tag="CategoryParentCategory">
        <mt:Unless tag="CategoryBasename" eq="azcom-newsletter">
          <mt:SetVar name="has_child_category" op="++">
        </mt:Unless>
      </mt:If>
    </mt:Categories>

    <mt:If name="has_child_category" gt="0">
      <h3 class="c-article-sidebar__section-title" style="font-size: var(--font-size-sm); margin-top: var(--space-sm);">カテゴリー一覧</h3>
      <ul class="c-article-sidebar__category-list">
        <mt:Categories>
          <mt:If tag="CategoryParentCategory">
            <mt:Unless tag="CategoryBasename" eq="azcom-newsletter">
              <li class="c-article-sidebar__category-item">
                <a href="<$mt:CategoryArchiveLink encode_html='1'$>">
                  <$mt:CategoryLabel encode_html="1"$>
                </a>
              </li>
            </mt:Unless>
          </mt:If>
        </mt:Categories>
      </ul>
    </mt:If>

    <mt:Ignore>— Tag list —</mt:Ignore>
    <h3 class="c-article-sidebar__section-title" style="font-size: var(--font-size-sm); margin-top: var(--space-md);">タグ一覧</h3>
    <ul class="c-article-sidebar__tag-list">
      <mt:Tags>
        <li class="c-article-sidebar__tag-item">
          <a href="/<$mt:Var name='sidebar_section' encode_html='1'$>/tags_<$mt:TagID encode_html='1'$>">
            <$mt:TagName encode_html="1"$>
          </a>
        </li>
      </mt:Tags>
    </ul>

  </section>

</aside>
```

- [ ] **Step 5.3: Mirror CSS**

```bash
cp assets/css/article-sidebar.css development-dev/assets/css/article-sidebar.css
```

- [ ] **Step 5.4: Commit**

```bash
git add assets/css/article-sidebar.css \
        development-dev/assets/css/article-sidebar.css \
        development-dev/templates/components/article/azcom-article-sidebar.mtml
git commit -m "feat: add sidebar wrapper + CSS (ranking, category, tag)"
```

---

## Task 6: Page Layout CSS + Prev/Next Component

**Files:**
- Create: `assets/css/article-page.css`
- Create: `assets/css/article-content.css`
- Create: `development-dev/templates/components/article/azcom-article-prev-next.mtml`

- [ ] **Step 6.1: Create `assets/css/article-page.css`**

```css
/* ==========================================================================
   Article Page Layout — shell for list / category / tag / detail pages
   ========================================================================== */

/* ── Shared: page padding ─────────────────────────────────────────────── */

.p-article-list,
.p-article-detail {
  padding-block: var(--space-5xl) var(--space-6xl);
}

/* ── List page: section heading ───────────────────────────────────────── */

.p-article-list__header {
  margin-bottom: var(--space-2xl);
}

.p-article-list__header-title {
  margin: 0;
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-heading);
  color: var(--color-accent);
}

.p-article-list__header-title::after {
  content: "";
  display: block;
  width: 100%;
  height: 4px;
  margin-top: var(--space-sm);
  background: linear-gradient(
    to right,
    var(--color-primary-dark) 0%,
    var(--color-primary-dark) 40%,
    transparent 100%
  );
}

/* ── Two-column layout body (main + sidebar) ──────────────────────────── */

.p-article-list__body,
.p-article-detail__body {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3xl);
}

.p-article-list__main,
.p-article-detail__main {
  flex: 1;
  min-width: 0;
}

.p-article-list__sidebar,
.p-article-detail__sidebar {
  flex-shrink: 0;
  width: 320px;
}

/* ── Empty state ──────────────────────────────────────────────────────── */

.p-article-list__empty {
  padding: var(--space-3xl) 0;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-body);
  color: var(--color-text-secondary);
  text-align: center;
}

/* ── Detail: article header ───────────────────────────────────────────── */

.p-article-detail__header {
  margin-bottom: var(--space-xl);
}

.p-article-detail__meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  flex-wrap: wrap;
}

.p-article-detail__date {
  font-family: var(--font-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-regular);
  color: var(--color-text-secondary);
}

.p-article-detail__category {
  display: inline-block;
  padding: 2px var(--space-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  background-color: var(--color-primary-light);
  border-radius: var(--radius-sm);
}

.p-article-detail__title {
  margin: 0;
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-heading);
  color: var(--color-primary-dark);
}

/* ── Prev/Next navigation ─────────────────────────────────────────────── */

.c-article-prev-next {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
  margin-top: var(--space-3xl);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--color-border);
}

.c-article-prev-next__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  max-width: 45%;
  text-decoration: none;
}

.c-article-prev-next__item--next {
  margin-left: auto;
  text-align: right;
}

.c-article-prev-next__label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.c-article-prev-next__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  line-height: var(--line-height-heading);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.c-article-prev-next__item:hover .c-article-prev-next__title {
  color: var(--color-primary-dark);
}

/* ── Tablet (768–1024px) ─────────────────────────────────────────────── */

@media (max-width: 1024px) and (min-width: 768px) {
  .p-article-list__sidebar,
  .p-article-detail__sidebar {
    width: 260px;
  }
}

/* ── Mobile (<768px) ─────────────────────────────────────────────────── */

@media (max-width: 767px) {
  .p-article-list,
  .p-article-detail {
    padding-block: var(--space-2xl) var(--space-2xl);
  }

  .p-article-list__header-title {
    font-size: var(--font-size-2xl);
  }

  .p-article-list__header {
    margin-bottom: var(--space-lg);
  }

  .p-article-list__body,
  .p-article-detail__body {
    flex-direction: column;
    gap: var(--space-2xl);
  }

  .p-article-list__sidebar,
  .p-article-detail__sidebar {
    width: 100%;
  }

  .p-article-detail__title {
    font-size: var(--font-size-xl);
  }

  .c-article-prev-next {
    flex-direction: column;
    gap: var(--space-lg);
  }

  .c-article-prev-next__item {
    max-width: 100%;
  }

  .c-article-prev-next__item--next {
    text-align: left;
    margin-left: 0;
  }
}
```

- [ ] **Step 6.2: Create `assets/css/article-content.css`**

```css
/* ==========================================================================
   Article Content — .mt-content wrapper for MT entry body HTML
   Scoped to avoid conflicts with other page CSS
   ========================================================================== */

.mt-content {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-body-relaxed);
  color: var(--color-text-primary);
  word-break: break-word;
  overflow-wrap: break-word;
}

.mt-content h2 {
  margin: var(--space-xl) 0 var(--space-md);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-heading);
  color: var(--color-primary-dark);
  padding-bottom: var(--space-sm);
  border-bottom: 2px solid var(--color-primary-light-2);
}

.mt-content h3 {
  margin: var(--space-lg) 0 var(--space-sm);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-heading);
  color: var(--color-primary-dark);
}

.mt-content h4 {
  margin: var(--space-md) 0 var(--space-sm);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-heading);
  color: var(--color-text-primary);
}

.mt-content p {
  margin: 0 0 var(--space-md);
}

.mt-content ul,
.mt-content ol {
  margin: 0 0 var(--space-md);
  padding-left: var(--space-xl);
}

.mt-content li {
  margin-bottom: var(--space-xs);
}

.mt-content img {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  margin-block: var(--space-md);
}

.mt-content a {
  color: var(--color-primary);
  text-decoration: underline;
}

.mt-content a:hover {
  color: var(--color-primary-dark);
}

.mt-content blockquote {
  margin: var(--space-lg) 0;
  padding: var(--space-md) var(--space-lg);
  border-left: 4px solid var(--color-primary-light-2);
  background-color: var(--color-primary-light);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  color: var(--color-text-secondary);
}

.mt-content table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--space-lg);
  font-size: var(--font-size-sm);
}

.mt-content th,
.mt-content td {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  text-align: left;
}

.mt-content th {
  background-color: var(--color-primary-light);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-dark);
}

@media (max-width: 767px) {
  .mt-content h2 {
    font-size: var(--font-size-lg);
  }

  .mt-content h3 {
    font-size: var(--font-size-md);
  }

  .mt-content table {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
```

- [ ] **Step 6.3: Create `azcom-article-prev-next.mtml`**

```mtml
<mt:Ignore>
  Prev/Next navigation for article detail page.
  Called inside entry context on detail.mtml.
  Note: MT native EntryPrevious/EntryNext do NOT filter by display_target.
        If adjacent entry is excluded from corporate, renders empty slot gracefully.
  CSS: article-page.css (.c-article-prev-next)
</mt:Ignore>

<mt:SetVar name="has_prev" value="0">
<mt:SetVar name="has_next" value="0">
<mt:SetVar name="prev_title" value="">
<mt:SetVar name="prev_url" value="">
<mt:SetVar name="next_title" value="">
<mt:SetVar name="next_url" value="">

<mt:EntryPrevious>
  <mt:SetVar name="has_prev" value="1">
  <mt:SetVar name="prev_title"><$mt:EntryTitle remove_html="1" encode_html="1"$></mt:SetVar>
  <mt:SetVar name="prev_url">/<$mt:Var name='article_card_section'$>/post_<$mt:EntryID$>/</mt:SetVar>
</mt:EntryPrevious>

<mt:EntryNext>
  <mt:SetVar name="has_next" value="1">
  <mt:SetVar name="next_title"><$mt:EntryTitle remove_html="1" encode_html="1"$></mt:SetVar>
  <mt:SetVar name="next_url">/<$mt:Var name='article_card_section'$>/post_<$mt:EntryID$>/</mt:SetVar>
</mt:EntryNext>

<mt:If name="has_prev" eq="1" OR name="has_next" eq="1">
<nav class="c-article-prev-next" aria-label="前後の記事">

  <mt:If name="has_prev" eq="1">
    <a class="c-article-prev-next__item c-article-prev-next__item--prev"
       href="<$mt:Var name='prev_url' encode_html='1'$>"
       rel="prev">
      <span class="c-article-prev-next__label">&#8592; 前の記事</span>
      <span class="c-article-prev-next__title"><$mt:Var name="prev_title"$></span>
    </a>
  <mt:Else>
    <span class="c-article-prev-next__item c-article-prev-next__item--prev" aria-hidden="true"></span>
  </mt:If>

  <mt:If name="has_next" eq="1">
    <a class="c-article-prev-next__item c-article-prev-next__item--next"
       href="<$mt:Var name='next_url' encode_html='1'$>"
       rel="next">
      <span class="c-article-prev-next__label">次の記事 &#8594;</span>
      <span class="c-article-prev-next__title"><$mt:Var name="next_title"$></span>
    </a>
  </mt:If>

</nav>
</mt:If>
```

- [ ] **Step 6.4: Mirror CSS files**

```bash
cp assets/css/article-page.css development-dev/assets/css/article-page.css
cp assets/css/article-content.css development-dev/assets/css/article-content.css
```

- [ ] **Step 6.5: Commit**

```bash
git add assets/css/article-page.css \
        assets/css/article-content.css \
        development-dev/assets/css/article-page.css \
        development-dev/assets/css/article-content.css \
        development-dev/templates/components/article/azcom-article-prev-next.mtml
git commit -m "feat: add page layout CSS, article-content CSS, prev-next component"
```

---

## Task 7: News List Page (`index.mtml`)

**Files:**
- Modify: `development-dev/blog/news/index.mtml`

- [ ] **Step 7.1: Replace placeholder body in `development-dev/blog/news/index.mtml`**

Replace the entire `<head>` CSS links section and the `<div class="l-container" style="height: 100vh;">` placeholder. The full updated file:

```mtml
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <mt:SetVarBlock name="meta_title">お知らせ | AZ-COMネットワーク</mt:SetVarBlock>
    <mt:SetVarBlock name="meta_description">運送業・物流企業の経営課題を解決する支援ネットワーク。</mt:SetVarBlock>
    <mt:SetVarBlock name="meta_canonical_url">https://www.azcom-net.jp/news/</mt:SetVarBlock>
    <mt:SetVar name="meta_og_image" value="assets/img/og-image_az-com-network.png">
    <mt:Include module="azcom-head-meta">

    <mt:SetVar name="assets_version" value="20260414">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/base.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/layout.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/utility.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/article-card.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/article-sidebar.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/article-page.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/pagination.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/header.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/footer.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/floating-button.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/go-to-top.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/subpage-hero.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/breadcrumb.css?v=<$mt:Var name='assets_version'$>">
</head>
<body>
    <mt:Include module="azcom-header">

    <main class="p-news-list p-article-list" id="main">

        <mt:SetVarBlock name="breadcrumb_lv1_label">トップ</mt:SetVarBlock>
        <mt:SetVarBlock name="breadcrumb_lv1_url">/</mt:SetVarBlock>
        <mt:SetVarBlock name="breadcrumb_current_label">お知らせ一覧</mt:SetVarBlock>
        <mt:SetVar name="breadcrumb_show_jsonld" value="1">
        <mt:Include module="azcom-breadcrumb">

        <mt:SetVar name="subpage_hero_bg" value="sub-img-001.png">
        <mt:SetVarBlock name="subpage_hero_title">お知らせ</mt:SetVarBlock>
        <mt:Include module="azcom-subpage-hero">

        <div class="l-container">

            <div class="p-article-list__header">
                <h2 class="p-article-list__header-title">新着のお知らせ</h2>
            </div>

            <div class="p-article-list__body">

                <div class="p-article-list__main">
                    <div class="c-article-grid">
                        <mt:SetVar name="article_query_limit" value="10">
                        <mt:SetVar name="article_query_lastn" value="300">
                        <mt:SetVar name="article_has_display_target" value="1">
                        <mt:SetVar name="article_card_section" value="news">
                        <mt:Include module="azcom-article-query-corporate">
                    </div>

                    <mt:If name="article_count" gt="0">
                        <mt:Include module="azcom-pagination">
                    </mt:If>
                </div>

                <div class="p-article-list__sidebar">
                    <mt:SetVar name="sidebar_section" value="news">
                    <mt:SetVar name="sidebar_has_display_target" value="1">
                    <mt:SetVar name="article_query_lastn" value="300">
                    <mt:Include module="azcom-article-sidebar">
                </div>

            </div>
        </div>
    </main>

    <mt:Include module="azcom-footer">

    <mt:SetVar name="go_to_top_href" value="#main">
    <mt:SetVarBlock name="go_to_top_aria_label">ページ先頭へ戻る</mt:SetVarBlock>
    <mt:SetVar name="go_to_top_text" value="TOP">
    <mt:Include module="azcom-go-to-top">

    <script defer src="<$mt:StaticWebPath encode_html='1'$>assets/js/go-to-top.js?v=<$mt:Var name='assets_version'$>"></script>
</body>
</html>
```

- [ ] **Step 7.2: Commit**

```bash
git add development-dev/blog/news/index.mtml
git commit -m "feat: implement news list page body (replace placeholder)"
```

---

## Task 8: News Category List Page

**Files:**
- Create: `development-dev/blog/news/category.mtml`

- [ ] **Step 8.1: Create `development-dev/blog/news/category.mtml`**

```mtml
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <mt:SetVarBlock name="meta_title"><$mt:CategoryLabel encode_html="1"$>に関連するお知らせ | AZ-COMネットワーク</mt:SetVarBlock>
    <mt:SetVarBlock name="meta_description"><$mt:CategoryLabel encode_html="1"$>カテゴリのお知らせ一覧です。</mt:SetVarBlock>
    <mt:SetVar name="meta_og_image" value="assets/img/og-image_az-com-network.png">
    <mt:Include module="azcom-head-meta">

    <mt:SetVar name="assets_version" value="20260414">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/base.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/layout.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/utility.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/article-card.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/article-sidebar.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/article-page.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/pagination.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/header.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/footer.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/floating-button.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/go-to-top.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/subpage-hero.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/breadcrumb.css?v=<$mt:Var name='assets_version'$>">
</head>
<body>
    <mt:Include module="azcom-header">

    <main class="p-news-list p-article-list" id="main">

        <mt:SetVarBlock name="breadcrumb_lv1_label">トップ</mt:SetVarBlock>
        <mt:SetVarBlock name="breadcrumb_lv1_url">/</mt:SetVarBlock>
        <mt:SetVarBlock name="breadcrumb_lv2_label">お知らせ一覧</mt:SetVarBlock>
        <mt:SetVarBlock name="breadcrumb_lv2_url">/news/</mt:SetVarBlock>
        <mt:SetVarBlock name="breadcrumb_current_label"><$mt:CategoryLabel encode_html="1"$></mt:SetVarBlock>
        <mt:SetVar name="breadcrumb_show_jsonld" value="1">
        <mt:Include module="azcom-breadcrumb">

        <mt:SetVar name="subpage_hero_bg" value="sub-img-001.png">
        <mt:SetVarBlock name="subpage_hero_title">お知らせ</mt:SetVarBlock>
        <mt:Include module="azcom-subpage-hero">

        <div class="l-container">

            <div class="p-article-list__header">
                <h2 class="p-article-list__header-title">
                    【<$mt:CategoryLabel encode_html="1"$>】に関連するお知らせ
                </h2>
            </div>

            <div class="p-article-list__body">

                <div class="p-article-list__main">
                    <div class="c-article-grid">
                        <mt:SetVar name="article_query_limit" value="10">
                        <mt:SetVar name="article_query_lastn" value="300">
                        <mt:SetVar name="article_has_display_target" value="1">
                        <mt:SetVar name="article_card_section" value="news">
                        <mt:Include module="azcom-article-query-corporate">
                    </div>

                    <mt:If name="article_count" gt="0">
                        <mt:Include module="azcom-pagination">
                    </mt:If>
                </div>

                <div class="p-article-list__sidebar">
                    <mt:SetVar name="sidebar_section" value="news">
                    <mt:SetVar name="sidebar_has_display_target" value="1">
                    <mt:SetVar name="article_query_lastn" value="300">
                    <mt:Include module="azcom-article-sidebar">
                </div>

            </div>
        </div>
    </main>

    <mt:Include module="azcom-footer">

    <mt:SetVar name="go_to_top_href" value="#main">
    <mt:SetVarBlock name="go_to_top_aria_label">ページ先頭へ戻る</mt:SetVarBlock>
    <mt:SetVar name="go_to_top_text" value="TOP">
    <mt:Include module="azcom-go-to-top">

    <script defer src="<$mt:StaticWebPath encode_html='1'$>assets/js/go-to-top.js?v=<$mt:Var name='assets_version'$>"></script>
</body>
</html>
```

- [ ] **Step 8.2: Commit**

```bash
git add development-dev/blog/news/category.mtml
git commit -m "feat: add news category list page"
```

---

## Task 9: News Tag List Page

**Files:**
- Create: `development-dev/blog/news/tag.mtml`

- [ ] **Step 9.1: Create `development-dev/blog/news/tag.mtml`**

```mtml
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <mt:SetVarBlock name="meta_title"><$mt:TagName encode_html="1"$>に関連するお知らせ | AZ-COMネットワーク</mt:SetVarBlock>
    <mt:SetVarBlock name="meta_description"><$mt:TagName encode_html="1"$>タグのお知らせ一覧です。</mt:SetVarBlock>
    <mt:SetVar name="meta_og_image" value="assets/img/og-image_az-com-network.png">
    <mt:Include module="azcom-head-meta">

    <mt:SetVar name="assets_version" value="20260414">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/base.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/layout.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/utility.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/article-card.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/article-sidebar.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/article-page.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/pagination.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/header.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/footer.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/floating-button.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/go-to-top.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/subpage-hero.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/breadcrumb.css?v=<$mt:Var name='assets_version'$>">
</head>
<body>
    <mt:Include module="azcom-header">

    <main class="p-news-list p-article-list" id="main">

        <mt:SetVarBlock name="breadcrumb_lv1_label">トップ</mt:SetVarBlock>
        <mt:SetVarBlock name="breadcrumb_lv1_url">/</mt:SetVarBlock>
        <mt:SetVarBlock name="breadcrumb_lv2_label">お知らせ一覧</mt:SetVarBlock>
        <mt:SetVarBlock name="breadcrumb_lv2_url">/news/</mt:SetVarBlock>
        <mt:SetVarBlock name="breadcrumb_current_label"><$mt:TagName encode_html="1"$></mt:SetVarBlock>
        <mt:SetVar name="breadcrumb_show_jsonld" value="1">
        <mt:Include module="azcom-breadcrumb">

        <mt:SetVar name="subpage_hero_bg" value="sub-img-001.png">
        <mt:SetVarBlock name="subpage_hero_title">お知らせ</mt:SetVarBlock>
        <mt:Include module="azcom-subpage-hero">

        <div class="l-container">

            <div class="p-article-list__header">
                <h2 class="p-article-list__header-title">
                    【<$mt:TagName encode_html="1"$>】に関連するお知らせ
                </h2>
            </div>

            <div class="p-article-list__body">

                <div class="p-article-list__main">
                    <div class="c-article-grid">
                        <mt:SetVar name="article_query_limit" value="10">
                        <mt:SetVar name="article_query_lastn" value="300">
                        <mt:SetVar name="article_has_display_target" value="1">
                        <mt:SetVar name="article_card_section" value="news">
                        <mt:Include module="azcom-article-query-corporate">
                    </div>

                    <mt:If name="article_count" gt="0">
                        <mt:Include module="azcom-pagination">
                    </mt:If>
                </div>

                <div class="p-article-list__sidebar">
                    <mt:SetVar name="sidebar_section" value="news">
                    <mt:SetVar name="sidebar_has_display_target" value="1">
                    <mt:SetVar name="article_query_lastn" value="300">
                    <mt:Include module="azcom-article-sidebar">
                </div>

            </div>
        </div>
    </main>

    <mt:Include module="azcom-footer">

    <mt:SetVar name="go_to_top_href" value="#main">
    <mt:SetVarBlock name="go_to_top_aria_label">ページ先頭へ戻る</mt:SetVarBlock>
    <mt:SetVar name="go_to_top_text" value="TOP">
    <mt:Include module="azcom-go-to-top">

    <script defer src="<$mt:StaticWebPath encode_html='1'$>assets/js/go-to-top.js?v=<$mt:Var name='assets_version'$>"></script>
</body>
</html>
```

- [ ] **Step 9.2: Commit**

```bash
git add development-dev/blog/news/tag.mtml
git commit -m "feat: add news tag list page"
```

---

## Task 10: News Detail Page

**Files:**
- Create: `development-dev/blog/news/detail.mtml`

- [ ] **Step 10.1: Create `development-dev/blog/news/detail.mtml`**

```mtml
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <mt:Entries id="$entry_id" lastn="1">
    <mt:SetVarBlock name="meta_title"><$mt:EntryTitle remove_html="1" encode_html="1"$> | AZ-COMネットワーク</mt:SetVarBlock>
    <mt:SetVarBlock name="meta_description"><$mt:EntryExcerpt remove_html="1" encode_html="1"$></mt:SetVarBlock>
    <mt:SetVar name="meta_og_image" value="assets/img/og-image_az-com-network.png">
    </mt:Entries>
    <mt:Include module="azcom-head-meta">

    <mt:SetVar name="assets_version" value="20260414">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/base.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/layout.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/utility.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/article-page.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/article-content.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/article-sidebar.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/header.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/footer.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/floating-button.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/go-to-top.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/subpage-hero.css?v=<$mt:Var name='assets_version'$>">
    <link rel="stylesheet" href="<$mt:StaticWebPath encode_html='1'$>assets/css/breadcrumb.css?v=<$mt:Var name='assets_version'$>">
</head>
<body>
    <mt:Include module="azcom-header">

    <main class="p-news-detail p-article-detail" id="main">

        <mt:Entry>

        <mt:SetVarBlock name="breadcrumb_lv1_label">トップ</mt:SetVarBlock>
        <mt:SetVarBlock name="breadcrumb_lv1_url">/</mt:SetVarBlock>
        <mt:SetVarBlock name="breadcrumb_lv2_label">お知らせ一覧</mt:SetVarBlock>
        <mt:SetVarBlock name="breadcrumb_lv2_url">/news/</mt:SetVarBlock>
        <mt:SetVarBlock name="breadcrumb_current_label"><$mt:EntryTitle remove_html="1" encode_html="1"$></mt:SetVarBlock>
        <mt:SetVar name="breadcrumb_show_jsonld" value="1">
        <mt:Include module="azcom-breadcrumb">

        <mt:SetVar name="subpage_hero_bg" value="sub-img-001.png">
        <mt:SetVarBlock name="subpage_hero_title">お知らせ</mt:SetVarBlock>
        <mt:Include module="azcom-subpage-hero">

        <div class="l-container">
            <div class="p-article-detail__body">

                <article class="p-article-detail__main">

                    <header class="p-article-detail__header">
                        <div class="p-article-detail__meta">
                            <time class="p-article-detail__date"
                                  datetime="<$mt:EntryDate format_name='iso8601'$>">
                                <$mt:EntryDate format="%Y.%m.%d"$>
                            </time>
                            <mt:EntryCategories glue="">
                                <mt:If tag="CategoryParentCategory">
                                    <span class="p-article-detail__category">
                                        <$mt:CategoryLabel encode_html="1"$>
                                    </span>
                                </mt:If>
                            </mt:EntryCategories>
                        </div>
                        <h1 class="p-article-detail__title">
                            <$mt:EntryTitle encode_html="1"$>
                        </h1>
                    </header>

                    <div class="mt-content">
                        <$mt:EntryBody$>
                        <$mt:EntryMore$>
                    </div>

                    <mt:SetVar name="article_card_section" value="news">
                    <mt:Include module="azcom-article-prev-next">

                </article>

                <div class="p-article-detail__sidebar">
                    <mt:SetVar name="sidebar_section" value="news">
                    <mt:SetVar name="sidebar_has_display_target" value="1">
                    <mt:SetVar name="article_query_lastn" value="300">
                    <mt:Include module="azcom-article-sidebar">
                </div>

            </div>
        </div>

        </mt:Entry>
    </main>

    <mt:Include module="azcom-footer">

    <mt:SetVar name="go_to_top_href" value="#main">
    <mt:SetVarBlock name="go_to_top_aria_label">ページ先頭へ戻る</mt:SetVarBlock>
    <mt:SetVar name="go_to_top_text" value="TOP">
    <mt:Include module="azcom-go-to-top">

    <script defer src="<$mt:StaticWebPath encode_html='1'$>assets/js/go-to-top.js?v=<$mt:Var name='assets_version'$>"></script>
</body>
</html>
```

- [ ] **Step 10.2: Commit**

```bash
git add development-dev/blog/news/detail.mtml
git commit -m "feat: add news article detail page"
```

---

## Task 11: Final Mirror + Verification

**Files:**
- Verify all CSS mirrored to `development-dev/assets/css/`
- Update `news.css` if any news-specific overrides needed

- [ ] **Step 11.1: Verify all CSS mirrors are up to date**

```bash
cd /Users/macbook_280/Downloads/movabletype/mt
diff assets/css/pagination.css development-dev/assets/css/pagination.css
diff assets/css/article-card.css development-dev/assets/css/article-card.css
diff assets/css/article-sidebar.css development-dev/assets/css/article-sidebar.css
diff assets/css/article-page.css development-dev/assets/css/article-page.css
diff assets/css/article-content.css development-dev/assets/css/article-content.css
```

Expected: no output (files are identical). If diff shows differences, re-run the cp commands from the relevant task.

- [ ] **Step 11.2: Verify directory structure created**

```bash
ls development-dev/templates/components/article/
```

Expected output:
```
azcom-article-card.mtml
azcom-article-prev-next.mtml
azcom-article-query-corporate.mtml
azcom-article-sidebar-ranking.mtml
azcom-article-sidebar.mtml
```

```bash
ls development-dev/templates/components/shared/ | grep pagination
```

Expected: `azcom-pagination.mtml`

- [ ] **Step 11.3: Browser verification checklist**

Open each page in browser (via Docker: `http://localhost:8082/news/`) and verify:

**List page (`/news/`):**
- [ ] Section heading "新着のお知らせ" renders with accent color + gradient underline
- [ ] Card grid is 2 columns on PC, 1 column on SP
- [ ] Each card shows: thumbnail placeholder (or image if custom field set), date, category badge, title
- [ ] Pagination renders prev/next + page numbers; active page highlighted
- [ ] Sidebar shows ranking (up to 5), category list (child only), tag list
- [ ] SP: sidebar appears below card grid, full width

**Category page (`/news/{slug}/`):**
- [ ] Heading shows "【CategoryName】に関連するお知らせ"
- [ ] Breadcrumb: トップ > お知らせ一覧 > CategoryName
- [ ] Same grid + sidebar layout as list page

**Tag page (`/news/tags_{id}`):**
- [ ] Heading shows "【TagName】に関連するお知らせ"
- [ ] Breadcrumb: トップ > お知らせ一覧 > TagName

**Detail page (`/news/post_{id}/`):**
- [ ] `<h1>` shows article title
- [ ] Date + category badge in meta area
- [ ] Article body renders in `.mt-content` with proper typography
- [ ] Prev/Next navigation appears if adjacent articles exist
- [ ] Prev/Next hides gracefully when at first/last article
- [ ] Sidebar renders correctly

**All pages:**
- [ ] 0-article empty state: "お知らせはまだありません。" renders, pagination hidden, sidebar still shows
- [ ] azcom-newsletter entries do NOT appear in corporate list
- [ ] `display_target=member` entries do NOT appear

- [ ] **Step 11.4: Final commit**

```bash
git add .
git commit -m "feat: complete news listing implementation (list/category/tag/detail + shared components)"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Card list with thumbnail | Task 2 |
| Section heading "新着のお知らせ" | Task 7 |
| Category heading "【cat】に関連するお知らせ" | Task 8 |
| Tag heading "【tag】に関連するお知らせ" | Task 9 |
| Detail article body + .mt-content | Task 10 |
| Prev/next navigation | Task 6 + 10 |
| Pagination | Task 1 + 7/8/9 |
| Sidebar: ranking (max 5 + fallback) | Task 4 |
| Sidebar: child categories, exclude azcom-newsletter | Task 5 |
| Sidebar: all tags | Task 5 |
| Responsive PC/SP | CSS in Tasks 2, 5, 6 |
| SP sidebar below content | Task 6 (`flex-direction: column`) |
| 0-entry empty state | Task 3 + 7 |
| Corporate filter (display_target, azcom-newsletter) | Task 3 |
| Cross-blog reusable naming | All tasks (azcom-article-*) |
| CSS mirror to development-dev | Tasks 1,2,5,6 + Step 11.1 |
| Admin escalation for thumbnail | Spec §5 (pre-condition, not code) |

**All spec requirements covered. No gaps found.**

**Placeholder scan:** No TBD, TODO, or vague steps. All steps include actual code or exact commands. ✅

**Type/naming consistency:**
- `article_card_section` used consistently in `azcom-article-card.mtml`, `azcom-article-prev-next.mtml`, and all page templates ✅
- `sidebar_section` used consistently in `azcom-article-sidebar.mtml` and all page templates ✅
- `article_has_display_target` / `sidebar_has_display_target` both set to `1` on news pages ✅
- CSS class `.c-article-card` matches between `article-card.css` and `azcom-article-card.mtml` ✅
- `.c-pagination` matches between `pagination.css` and `azcom-pagination.mtml` ✅
