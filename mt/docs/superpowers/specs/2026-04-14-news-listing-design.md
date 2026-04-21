# News Listing Screen — Design Spec
**Date:** 2026-04-14  
**Version:** 1.0.0  
**Scope:** `/news/`, `/news/{slug}/`, `/news/tags_{id}`, `/news/post_{id}`  
**Author:** Brainstorming session

---

## 1. Overview

Implement the News section of the AZ-COM corporate site using Movable Type static generation. The implementation covers 4 screens (list, category list, tag list, detail) with a shared right sidebar. All components are named for cross-blog reuse (`azcom-article-*`) so they can be applied to `activity-report`, `support`, and `supplier` in later phases.

### Key constraints
- Corporate site only — exclude `azcom-newsletter` category and `display_target=member` entries
- 10 entries per page, MT native static pagination
- Sidebar shared across all 4 screens
- Thumbnail custom field needs Admin setup before image rendering is enabled
- NEW badge: out of scope for this phase
- Production: MT Cloud rebuild → push static HTML to separate web server

---

## 2. Screens

| Screen | URL pattern | Template |
|---|---|---|
| News list | `/news/` | `blog/news/index.mtml` |
| Category list | `/news/{slug}/` | `blog/news/category.mtml` |
| Tag list | `/news/tags_{id}` | `blog/news/tag.mtml` |
| Article detail | `/news/post_{id}` | `blog/news/detail.mtml` |

### Section titles (dynamic)

| Screen | Title |
|---|---|
| List | `新着のお知らせ` (hardcoded) |
| Category | `【CategoryLabel】に関連するお知らせ` |
| Tag | `【TagName】に関連するお知らせ` |
| Detail | `<h1>` = `<$mt:EntryTitle$>` |

---

## 3. Architecture — Approach C

**MTML:** Modular components named `azcom-article-*` for cross-blog reuse.  
**CSS:** Split by concern — each file is independently reusable.

### 3.1 File Structure

```
development-dev/
├── blog/
│   └── news/
│       ├── index.mtml              ← implement body (was placeholder)
│       ├── category.mtml           ← NEW
│       ├── tag.mtml                ← NEW
│       └── detail.mtml             ← NEW
│
└── templates/
    └── components/
        ├── shared/
        │   └── azcom-pagination.mtml          ← NEW (global, reused by search)
        └── article/                           ← NEW folder
            ├── azcom-article-card.mtml
            ├── azcom-article-query-corporate.mtml
            ├── azcom-article-sidebar.mtml
            ├── azcom-article-sidebar-ranking.mtml
            └── azcom-article-prev-next.mtml

assets/css/
├── pagination.css          ← NEW (global, reused by search page later)
├── article-card.css        ← NEW (.c-article-card)
├── article-sidebar.css     ← NEW (.c-article-sidebar)
├── article-page.css        ← NEW (page layout shell)
├── article-content.css     ← NEW (.mt-content article body)
└── news.css                ← (exists) page-specific overrides only
```

> **Mirror rule:** All `assets/css/` edits must be mirrored to `development-dev/assets/css/`.

---

## 4. Data Model

### 4.1 Entry Fields

| Field | MT Tag | Status |
|---|---|---|
| `post_id` | `<$mt:EntryID$>` | Native |
| `title` | `<$mt:EntryTitle$>` | Native |
| `body` | `<$mt:EntryBody$>` | Native |
| `thumbnail` | `<$mt:EntryCustomField basename="thumbnail"$>` | **⚠ Admin setup required** |
| `category` | `<mt:EntryCategories>` | Native |
| `tags` | `<mt:EntryTags>` | Native |
| `published_at` | `<$mt:EntryDate format="%Y.%m.%d"$>` | Native |
| `display_target` | `<$mt:EntryCustomField basename="display_target"$>` | Exists |
| `ranking_enabled` | `<$mt:EntryCustomField basename="ranking_enabled"$>` | Exists |

### 4.2 Display Rules — Corporate Site

```
SHOW entry IF:
  status = published
  AND category.basename != "azcom-newsletter"   ← azcom-newsletter = member only
  AND (
    display_target == "corporate"
    OR display_target == "both"
    OR display_target == ""   ← backward-compat default
  )
```

For `supplier` blog: no `display_target` check — show all published entries.

---

## 5. Admin Setup Required

### ⚠ thumbnail Custom Field

| Attribute | Value |
|---|---|
| Type | `CustomField` — Image Asset |
| Scope | Entry — all 4 blogs (news, activity-report, support, supplier) |
| Basename | `thumbnail` |
| Label | サムネイル / Thumbnail |
| Required | No (card renders placeholder if empty) |

**Setup order:**
1. MT Admin → Fields → New Custom Field
2. Type: Image Asset, Basename: `thumbnail`
3. Apply to: Entry (select all target blogs)
4. Rebuild all templates after creation

**Dependency:** `azcom-article-card.mtml` and `azcom-article-sidebar-ranking.mtml` render thumbnail placeholder until this field is created. Enable actual image rendering after Admin setup.

**MTML fallback pattern:**
```mtml
<mt:If tag="EntryCustomField basename='thumbnail'" eq="">
  <div class="c-article-card__thumb-placeholder" aria-hidden="true"></div>
<mt:Else>
  <img class="c-article-card__thumb-img"
       src="<$mt:EntryCustomField basename='thumbnail'$>"
       alt="<$mt:EntryTitle encode_html='1'$>"
       width="400" height="250" loading="lazy">
</mt:If>
```

---

## 6. Component Interfaces (Variable Contracts)

### azcom-article-query-corporate.mtml
```
Input:
  article_query_limit         — max entries to render (10 for list pages)
  article_query_lastn         — pool to scan (default 300)
  article_has_display_target  — 1 = check display_target (news/activity/support)
                                0 = skip check (supplier)
Output:
  Renders filtered .c-article-card items
  Sets: article_count (integer)
```

### azcom-article-sidebar.mtml
```
Input:
  sidebar_section              — "news" / "activity-report" / "support" / "supplier"
  sidebar_has_display_target   — 1 or 0
Output:
  .c-article-sidebar with ranking + category + tag sections
```

### azcom-pagination.mtml
```
Called inside <mt:PagerBlock> context (MT native)
Output:
  .c-pagination HTML
  Compatible with JS client-side enhancement (for search page)
```

### azcom-article-prev-next.mtml
```
Called on detail page inside entry context
Uses: <mt:EntryPrevious> / <mt:EntryNext>
Note: if prev/next entry fails corporate filter, renders empty gracefully
```

---

## 7. Layout Design

### 7.1 Page Structure

**List / Category / Tag pages:**
```
.p-article-list
  └── .l-container
        ├── .p-article-list__header
        │     └── .p-article-list__header-title   ← H2, dynamic
        └── .p-article-list__body
              ├── .p-article-list__main            ← flex: 1
              │     ├── .c-article-grid            ← 2-col CSS Grid
              │     │     └── .c-article-card × N
              │     └── .c-pagination
              └── .p-article-list__sidebar         ← 320px fixed
                    └── .c-article-sidebar
```

**Detail page:**
```
.p-article-detail
  └── .l-container
        └── .p-article-detail__body
              ├── .p-article-detail__main
              │     ├── .mt-content
              │     └── .c-article-prev-next
              └── .p-article-detail__sidebar       ← 320px fixed
                    └── .c-article-sidebar
```

### 7.2 Responsive

| | PC (>1024px) | Tablet (768–1024px) | SP (<768px) |
|---|---|---|---|
| Layout | Horizontal (main + sidebar) | Horizontal (sidebar shrinks) | Vertical: main → sidebar below |
| Card grid | 2 columns | 2 columns | 1 column |
| Sidebar width | 320px | 260px | 100% |
| Card thumbnail | aspect-ratio 16/9 | 16/9 | 16/9 |

**SP rule:** Sidebar renders **below** main content (not hidden/collapsed).

---

## 8. CSS Class Map

### article-page.css
```
.p-article-list
.p-article-list__header
.p-article-list__header-title
.p-article-list__body
.p-article-list__main
.p-article-list__sidebar
.p-article-list__empty          ← 0-entry fallback

.p-article-detail
.p-article-detail__body
.p-article-detail__main
.p-article-detail__sidebar
```

### article-card.css
```
.c-article-grid                 ← 2-col CSS Grid
.c-article-card
.c-article-card__thumb
.c-article-card__thumb-img
.c-article-card__thumb-placeholder
.c-article-card__body
.c-article-card__meta           ← date + category row
.c-article-card__date
.c-article-card__category       ← badge
.c-article-card__title
.c-article-card--no-thumb       ← modifier (future: search results)
```

### article-sidebar.css
```
.c-article-sidebar
.c-article-sidebar__section
.c-article-sidebar__section-title
.c-article-sidebar__ranking-list
.c-article-sidebar__ranking-item
.c-article-sidebar__ranking-num
.c-article-sidebar__ranking-thumb
.c-article-sidebar__ranking-title
.c-article-sidebar__category-list
.c-article-sidebar__category-item
.c-article-sidebar__tag-list
.c-article-sidebar__tag-item
```

### pagination.css
```
.c-pagination
.c-pagination__list
.c-pagination__item
.c-pagination__link
.c-pagination__link--active
.c-pagination__link--prev
.c-pagination__link--next
.c-pagination__link--disabled
```

### article-content.css
```
.mt-content                     ← article body wrapper
.mt-content h2, h3, h4
.mt-content p, ul, ol, table
.mt-content img
.mt-content blockquote
```

### article-prev-next.css (or bundled into article-page.css)
```
.c-article-prev-next
.c-article-prev-next__item
.c-article-prev-next__item--prev
.c-article-prev-next__item--next
.c-article-prev-next__label
.c-article-prev-next__title
```

---

## 9. Design Token Usage

| Element | Token |
|---|---|
| Section title | `--font-size-3xl` (PC) / `--font-size-2xl` (SP), `--color-accent` |
| Card title | `--font-size-lg` (PC) / `--font-size-md` (SP), `--font-weight-bold` |
| Card date | `--font-size-xs`, `--color-text-secondary`, `--font-secondary` |
| Category badge | `--radius-sm`, `--color-primary-light`, `--color-primary` |
| Sidebar title | `--font-size-md`, `--color-primary-dark`, `--font-weight-bold` |
| Ranking #1 badge | `--color-accent` |
| Ranking #2–5 badge | `--color-text-secondary` |
| Pagination active | `--color-primary` (bg), `--color-white` (text) |
| Card hover | `--shadow-md`, scale thumbnail slightly |
| Card border-radius | `--radius-md` (card), `--radius-sm` (badge) |

---

## 10. MTML Logic

### 10.1 Corporate Filter

```
SET article_count = 0
SCAN Entries(lastn=300, sort=authored_on desc)
  IF article_count < article_query_limit:
    is_newsletter = (CategoryBasename == "azcom-newsletter") ? 1 : 0
    is_corp_target:
      IF article_has_display_target == 0 → 1 (always show, e.g. supplier)
      ELSE IF display_target IN ["corporate","both",""] → 1 ELSE 0
    IF NOT is_newsletter AND is_corp_target:
      RENDER card
      article_count++
IF article_count == 0: RENDER empty state
```

### 10.2 Sidebar Ranking (Phase 1 + Fallback)

```
PHASE 1 (ranking_enabled=1, up to 5):
  SCAN Entries(lastn=300, sort=authored_on desc)
    APPLY corporate filter
    IF ranking_enabled == 1 AND rank_count < 5:
      RENDER ranking item, rank_count++

PHASE 2 (fallback if rank_count < 5):
  SCAN Entries(lastn=300, sort=authored_on desc)
    APPLY corporate filter
    IF ranking_enabled == 0 AND rank_count < 5:
      SKIP entries already rendered in phase 1
      RENDER ranking item, rank_count++
```

### 10.3 Sidebar Category

```
<mt:Categories blog_id="[News]">
  IF CategoryParentCategory exists (= is child):
    UNLESS CategoryBasename == "azcom-newsletter":
      RENDER category link → /news/{CategoryBasename}/
```

### 10.4 Sidebar Tag

```
<mt:Tags blog_id="[News]">
  RENDER tag link → /news/tags_{TagID}
```
> MT does not provide `<mt:TagArchiveLink>` in the custom `tags_{id}` format — construct URL manually using `<$mt:TagID$>`.

### 10.5 Prev/Next on Detail Page

```
<mt:EntryPrevious>: link if exists, else .c-article-prev-next__item--prev is empty
<mt:EntryNext>:     link if exists, else .c-article-prev-next__item--next is empty
Note: MT native prev/next does not filter by display_target.
      If prev/next entry is a member-only or azcom-newsletter entry,
      render it as missing (empty slot) gracefully.
```

### 10.6 Pagination (MT Native)

```
<mt:PagerBlock>
  → <mt:Include module="azcom-pagination">
  → renders .c-pagination with prev/next/number links
  → static HTML pre-generated per page at rebuild time
  → markup is compatible with future JS search pagination
```

---

## 11. Empty State Rules

| Scenario | Behavior |
|---|---|
| 0 articles on list page | Show `.p-article-list__empty` message, no pagination |
| 0 ranking items | Hide ranking section OR show "まだありません" |
| 0 categories | Hide category section |
| 0 tags | Hide tag section |
| No prev article | `.c-article-prev-next__item--prev` renders empty/disabled |
| No next article | `.c-article-prev-next__item--next` renders empty/disabled |

---

## 12. Out of Scope (This Phase)

- NEW badge on cards
- Search page (`/search/`) — separate task
- Member site display_target=member filtering
- activity-report / support / supplier section implementation (reuse these components)

---

## 12a. JSON API Setup (✅ IMPLEMENTED)

### Overview

Static JSON API endpoints have been implemented for Member site consumption. Corporate site HTML remains unchanged (Phase 1 only - no HTML refactoring).

### File Structure Created

```
development-dev/
├── templates/
│   └── api/
│       ├── api-news-list.mtml           # Index Template
│       ├── api-news-category.mtml       # Category Archive
│       ├── api-news-tag.mtml            # Tag Archive
│       ├── api-news-detail.mtml         # Entry Archive
│       └── api-sidebar.mtml             # Index Template
└── templates/components/api/
    ├── azcom-json-article-item.mtml        # Article JSON object
    ├── azcom-json-sidebar-ranking.mtml     # Ranking JSON array
    ├── azcom-json-sidebar-categories.mtml  # Categories JSON array
    └── azcom-json-sidebar-tags.mtml        # Tags JSON array

development-cloud/
└── (same structure, direct CF tags instead of proxy)
```

### MT Admin Setup Steps

#### Step 1: Create Template Modules (Website Level)

Go to **AZ-COM-LOCALHOST (Website) → Design → Templates → Create → Template Module**:

| Module Name | Source File |
|---|---|
| `azcom-json-article-item` | `development-dev/templates/components/api/azcom-json-article-item.mtml` |
| `azcom-json-sidebar-ranking` | `development-dev/templates/components/api/azcom-json-sidebar-ranking.mtml` |
| `azcom-json-sidebar-categories` | `development-dev/templates/components/api/azcom-json-sidebar-categories.mtml` |
| `azcom-json-sidebar-tags` | `development-dev/templates/components/api/azcom-json-sidebar-tags.mtml` |

**For each module:**
1. Click "Create → Template Module"
2. Name: (module name from table)
3. Paste content from source file
4. Click "Save"

#### Step 2: Create Index Templates (News Blog Level)

Go to **News → Design → Templates → Create → Index Template**:

1. **API: News List**
   - Template Name: `API: News List`
   - Output File: `api/news-list.json`
   - Paste content from `development-dev/templates/api/api-news-list.mtml`
   - Save

2. **API: Sidebar**
   - Template Name: `API: Sidebar`
   - Output File: `api/sidebar.json`
   - Paste content from `development-dev/templates/api/api-sidebar.mtml`
   - Save

#### Step 3: Create Archive Templates (News Blog Level)

Go to **News → Design → Templates → Create → Archive Template**:

1. **API: News Category**
   - Template Name: `API: News Category`
   - Archive Type: `Category`
   - Paste content from `development-dev/templates/api/api-news-category.mtml`
   - Save
   - **⚠️ Configure Archive Mapping:**
     - Click "Archive Mapping" tab
     - Toggle "Type" to ON (green/active)
     - Archive Path: `api/news-category-<$mt:CategoryBasename$>.json`
     - Save Mapping

2. **API: News Tag**
   - Template Name: `API: News Tag`
   - Archive Type: `Tag`
   - Paste content from `development-dev/templates/api/api-news-tag.mtml`
   - Save
   - **⚠️ Configure Archive Mapping:**
     - Toggle "Type" to ON
     - Archive Path: `api/news-tag-<$mt:TagID$>.json`
     - Save Mapping

3. **API: News Detail**
   - Template Name: `API: News Detail`
   - Archive Type: `Entry`
   - Paste content from `development-dev/templates/api/api-news-detail.mtml`
   - Save
   - **⚠️ Configure Archive Mapping:**
     - Toggle "Type" to ON
     - Archive Path: `api/news-detail-<$mt:EntryID$>.json`
     - Save Mapping

#### Step 4: Rebuild Templates

1. Go to **News → Rebuild**
2. **First:** Select "Only Index Templates" → Click "Rebuild"
   - Wait for completion (check progress bar)
   - Expected: `api/news-list.json` and `api/sidebar.json` generated
3. **Second:** Select "Only Page Archives" → Click "Rebuild"
   - Wait for completion
   - Expected: `api/news-category-*.json`, `api/news-tag-*.json`, `api/news-detail-*.json` generated

### Testing JSON Endpoints

**Method 1: Browser**
- http://localhost:8082/api/sidebar.json
- http://localhost:8082/api/news-list.json
- http://localhost:8082/api/news-category-security.json (replace `security` with actual category slug)
- http://localhost:8082/api/news-tag-2.json (replace `2` with actual tag ID)
- http://localhost:8082/api/news-detail-8.json (replace `8` with actual entry ID)

**Method 2: Terminal (jq validation)**

```bash
# Test sidebar
curl http://localhost:8082/api/sidebar.json | jq .

# Expected output:
{
  "ranking": [ ... max 5 items ... ],
  "categories": [ ... child categories only ... ],
  "tags": [ ... all tags ... ]
}

# Test news list
curl http://localhost:8082/api/news-list.json | jq '.articles | length'
# Expected: number (max 10)

# Verify field types
curl http://localhost:8082/api/news-list.json | jq '.articles[0].id | type'
# Expected: "number"

curl http://localhost:8082/api/news-list.json | jq '.articles[0].title | type'
# Expected: "string"

# Check no newsletter entries
curl http://localhost:8082/api/news-list.json | jq '.articles[] | select(.category.slug == "azcom-newsletter")'
# Expected: (empty - no output)

# Check thumbnail field (local = empty string)
curl http://localhost:8082/api/news-list.json | jq '.articles[0].thumbnail'
# Expected: ""
```

### Validation Checklist

- [ ] `/api/sidebar.json` exists and contains `ranking`, `categories`, `tags` arrays
- [ ] Ranking max 5 items, phase 1 (ranking_enabled=1) + phase 2 fallback
- [ ] Categories: only child categories, no `azcom-newsletter`
- [ ] `/api/news-list.json` contains `meta` object (total, page, limit, has_next) and `articles` array (max 10)
- [ ] Category JSON (`api/news-category-*.json`) filters correctly (only that category)
- [ ] Tag JSON (`api/news-tag-*.json`) filters correctly (only that tag)
- [ ] Detail JSON (`api/news-detail-*.json`) contains full article with `body_html` and `meta` object
- [ ] All JSON syntax valid (test with `jq` or https://jsonlint.com/)
- [ ] No newsletter entries in any output
- [ ] Thumbnails: empty string `""` on local (no CustomFields), actual URL on Cloud

### JSON Response Schemas

**List Response** (`news-list.json`, `news-category-*.json`, `news-tag-*.json`):
```json
{
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "total_pages": 5,
    "has_prev": false,
    "has_next": true,
    "prev_url": null,
    "next_url": "/api/news-list/page/2.json"
  },
  "articles": [
    {
      "id": 8,
      "title": "記事タイトル",
      "slug": "post_8",
      "url": "/news/post_8/",
      "thumbnail": "",
      "category": {"id": 3, "label": "セキュリティ", "slug": "security", "url": "/news/security/"},
      "date": "2026.04.14",
      "datetime": "2026-04-14T10:30:00+09:00",
      "excerpt": "記事の概要...",
      "tags": ["タグA", "タグB"]
    }
  ]
}
```

**Detail Response** (`news-detail-*.json`):
```json
{
  "article": {
    ... (same fields as list) ...,
    "body_html": "<p>記事本文HTML...</p>",
    "meta": {
      "description": "SEO meta description",
      "published_at": "2026-04-14T10:30:00+09:00",
      "updated_at": "2026-04-14T15:20:00+09:00"
    }
  }
}
```

**Sidebar Response** (`sidebar.json`):
```json
{
  "ranking": [
    {"rank": 1, "id": 5, "title": "...", "url": "/news/post_5/", "thumbnail": "", "date": "2026.04.10", "datetime": "..."}
  ],
  "categories": [
    {"id": 3, "label": "セキュリティ", "slug": "security", "url": "/news/security/", "count": 15}
  ],
  "tags": [
    {"id": 2, "name": "タグA", "url": "/news/tags_2/", "count": 8}
  ]
}
```

### Cloud Deployment

For MT Cloud, use files from `development-cloud/templates/api/` instead of `development-dev/`.

**Differences:**
- Direct `<$mt:EntryCustomField>` tags (no azcom-article-cf-entry proxy)
- `cf_display_target` filter active (excludes member-only entries)
- Thumbnails show actual URLs from CustomField

**Upload steps:** Same as local (Steps 1-4 above), but paste from `development-cloud/` folder.

### Troubleshooting

**Issue**: JSON file not generated after rebuild  
**Solution**: Check template name matches Archive Type. Verify Archive Mapping "Type" toggle is ON (green).

**Issue**: JSON syntax error  
**Solution**: Validate with `curl ... | jq .` to see exact error line.

**Issue**: Empty `articles` array  
**Solution**: Check filter logic. On local (no CF), all published non-newsletter entries should appear.

**Issue**: Category/Tag archive returns 404  
**Solution**: Ensure at least one entry has that category/tag. MT doesn't generate archives for empty categories/tags.

---

## 12b. MT Admin Setup Guide

### Template structure overview

MT stores templates in two levels:
- **Website level** (AZ-COM-LOCALHOST) — shared modules accessible to ALL child blogs
- **Blog level** (News, Activity-Report, etc.) — templates specific to that blog

### Rule: where to create each template type

| Template type | Level | Reason |
|---|---|---|
| Index Template (list page) | Blog (News) | Specific to News blog |
| Archive Template (category/tag/detail) | Blog (News) | Specific to News blog |
| Template Module `azcom-article-*` | **Website** | Cross-blog reuse (activity-report, support, supplier) |
| Template Module `azcom-pagination` | **Website** | Reused by search page too |

### Step 1 — Update existing templates in News blog

| MT Template Name | Action | Source file |
|---|---|---|
| `News Index` | Edit → paste content | `development-dev/blog/news/index.mtml` |
| `Entry Detail` | Edit → paste content | `development-dev/blog/news/detail.mtml` |

### Step 2 — Create new Archive Templates in News blog

Go to **News → Design → Templates → Create → Archive Template**:

| Template Name | Archive Type | Archive Path |
|---|---|---|
| `News Category` | `Category` | `%c/%i` |
| `News Tag` | `Tag` | `tags_<$mt:TagID$>/%i` |

Paste content from `category.mtml` / `tag.mtml` respectively.

**Archive Path tokens:**
- `%c` = category basename/slug (e.g. `office-announcement`)
- `%i` = index filename (`index.html`)
- `<$mt:TagID$>` = numeric database ID of the tag

**⚠️ Tag URL note:** Spec defines `{id}` as `tag_key` (e.g. `tag1001`). MT's `<$mt:TagID$>` is a numeric DB ID (1, 2, 3...). Verify with team whether `{id}` in `/news/tags_{id}` should be the numeric DB ID or tag name. Alternative: use `tags_%t/%i` to get `/news/tags_BCP/` (tag name in URL). **Using `<$mt:TagID$>` for now — confirm before production.**

### Step 2b — Environment config: `azcom-env-config` module

**Folder strategy** — delta-folder approach:

```
development-dev/           ← source of truth (upload to ALL environments)
  templates/components/shared/azcom-env-config.mtml   ← env_has_cf = 0 (local default)
  templates/components/article/azcom-article-cf-entry.mtml  ← CF proxy (cloud only, skip on local)

development-cloud/         ← delta: files that DIFFER on cloud (override dev version)
  templates/components/shared/azcom-env-config.mtml   ← env_has_cf = 1 (cloud override)
```

**Deploy rules:**

| Env | Source | Override | Notes |
|---|---|---|---|
| Local MT Admin | `development-dev/` (all) | — | Skip `azcom-article-cf-entry.mtml` |
| MT Cloud | `development-dev/` (all) | `development-cloud/` | Also upload `azcom-article-cf-entry.mtml` |

**Behavior by env_has_cf value:**
- `0` (local) → all entries visible, thumbnails = placeholder, ranking = top-5 by date
- `1` (cloud) → display_target filter active, real thumbnails, ranking_enabled respected

### Step 3 — Create Template Modules at WEBSITE level

Go to **AZ-COM-LOCALHOST (Website) → Design → Templates → Create → Template Module**:

| Module Name | Source file |
|---|---|
| `azcom-article-card` | `development-dev/templates/components/article/azcom-article-card.mtml` |
| `azcom-article-query-corporate` | `development-dev/templates/components/article/azcom-article-query-corporate.mtml` |
| `azcom-article-sidebar-ranking` | `development-dev/templates/components/article/azcom-article-sidebar-ranking.mtml` |
| `azcom-article-sidebar` | `development-dev/templates/components/article/azcom-article-sidebar.mtml` |
| `azcom-article-prev-next` | `development-dev/templates/components/article/azcom-article-prev-next.mtml` |
| `azcom-pagination` | `development-dev/templates/components/shared/azcom-pagination.mtml` |
| `azcom-env-config` | `development-dev/templates/components/shared/azcom-env-config.mtml` |
| `azcom-article-cf-entry` | `development-dev/templates/components/article/azcom-article-cf-entry.mtml` ⚠️ **Cloud only** |

### Step 4 — Rebuild

News blog → Rebuild → Rebuild All

---

## 12c. Tag ID vs Tag Key — Open Question

The spec (`spec-category.md §3.3`) defines tag URL as `/news/tags_{id}` where `{id}` corresponds to `tag_key` (e.g. `tag1001`).

MT Admin's `<$mt:TagID$>` outputs the numeric database row ID (auto-incremented: 1, 2, 3...).

**Three options:**

| Option | Archive Path | URL result | Pros | Cons |
|---|---|---|---|---|
| A — MT numeric ID | `tags_<$mt:TagID$>/%i` | `/news/tags_5/` | Simple, native MT | ID not predictable, doesn't match `tag1001` style |
| B — Tag name | `tags_%t/%i` | `/news/tags_BCP/` | Human-readable | Long URLs, breaks on rename |
| C — Custom tag basename | Custom field on tag | `/news/tags_tag1001/` | Matches spec key | Requires extra Admin setup |

**Current implementation uses Option A.** Confirm with team before production.

---

## 13. Implementation Checklist

### Admin Setup (must complete before thumbnail works)
- [ ] Create `thumbnail` Custom Field (Image Asset) on Entry scope for all blogs

### MTML Templates
- [ ] `azcom-article-query-corporate.mtml` — corporate filter query module
- [ ] `azcom-article-card.mtml` — card component (thumbnail placeholder)
- [ ] `azcom-article-sidebar-ranking.mtml` — ranking with phase 1 + fallback
- [ ] `azcom-article-sidebar.mtml` — sidebar wrapper (ranking + category + tag)
- [ ] `azcom-pagination.mtml` — global pagination component
- [ ] `azcom-article-prev-next.mtml` — prev/next navigation
- [ ] `blog/news/index.mtml` — implement main body (was placeholder)
- [ ] `blog/news/category.mtml` — new
- [ ] `blog/news/tag.mtml` — new
- [ ] `blog/news/detail.mtml` — new

### CSS Files (assets/ + mirror to development-dev/assets/)
- [ ] `article-card.css` — `.c-article-card` component
- [ ] `article-sidebar.css` — `.c-article-sidebar` component
- [ ] `article-page.css` — page layout shell
- [ ] `article-content.css` — `.mt-content` article body styles
- [ ] `pagination.css` — `.c-pagination` global component
- [ ] Update `news.css` — link new CSS files in `<head>` of news pages

### Verification
- [ ] List page renders 10 articles, corporate filter works
- [ ] Category page title shows "【cat名】に関連するお知らせ"
- [ ] Tag page title shows "【tag名】に関連するお知らせ"
- [ ] Sidebar ranking shows max 5, fallback to non-ranking entries
- [ ] Category list shows only child categories, excludes azcom-newsletter
- [ ] Tag list shows all news tags, links to /news/tags_{id}
- [ ] Detail page prev/next renders gracefully when no adjacent article
- [ ] 0-entry empty state renders, sidebar still shows
- [ ] SP layout: sidebar below main content
- [ ] Pagination: prev/next/numbers correct, active state highlighted
- [ ] Thumbnail placeholder shows when custom field not set

---

## 14. Notes for Future Sessions

- **Cross-blog reuse:** To apply this to `activity-report`, copy page templates to `blog/activity-report/`, pass correct `sidebar_section` and `sidebar_has_display_target` vars. CSS and MTML modules require zero changes.
- **Thumbnail activation:** After Admin creates `thumbnail` custom field, update `azcom-article-card.mtml` to replace placeholder with actual `<$mt:EntryCustomField basename="thumbnail"$>`.
- **JSON API templates:** After news HTML is complete, create MT Index Templates for `/api/news-ranking.json` and `/api/news-sidebar.json` using same filter logic as `azcom-article-query-corporate.mtml`.
- **Search integration:** `azcom-pagination.mtml` and `pagination.css` are designed to be JS-enhanceable — search page can reuse markup and add client-side click handlers.
- **Prev/Next display_target gap:** MT native `<mt:EntryPrevious>/<mt:EntryNext>` does not respect `display_target`. If this causes incorrect prev/next links on corporate, implement custom loop scan as a future improvement.
