# Support Screen — Design Spec
**Date:** 2026-04-24  
**Version:** 1.0.0  
**Scope:** Corporate + Member APIs and pages for Support blog  
**Approach:** B (reuse-first, thin wiring templates)

---

## 1. Objective

Implement Support screen and APIs by reusing the News architecture and shared modules, while applying Support-specific business rules:

- Support categories are fixed and do not use News newsletter exception logic.
- Corporate and Member endpoints follow naming parallel to News.
- CustomFields are same as News (`thumbnail`, `display_target`, `ranking_enabled`, `meta_description`).

---

## 2. Confirmed Decisions

1. Implement **both** Corporate and Member side for Support in this phase.
2. Endpoint naming follows **parallel-news** format.
3. Support blog already exists in MT Cloud.
4. Support categories are fixed child categories:
   - `cost-reduction`
   - `safety-and-accident-prevention`
   - `recruitment-and-training`
   - `business-support`
   - `vehicle-and-infrastructure`
   - `finance-and-leasing`
   - `health-and-medical-support`
   - `employee-benefits`
5. Support does **not** use category exception logic like `azcom-newsletter`.

---

## 3. Reuse Strategy (Approach B)

### 3.1 Reuse without changes

- Shared JS/CSS:
  - `assets/js/api-client.js`
  - `assets/js/article-list.js`
  - `assets/js/article-sidebar.js`
  - `assets/js/article-prev-next.js`
  - article CSS set (`article-card.css`, `article-sidebar.css`, `article-page.css`, `pagination.css`, `skeleton.css`)
- Shared item/sidebar rendering modules:
  - `templates/components/api/azcom-json-article-item.mtml`
  - `templates/components/api/azcom-json-sidebar-categories.mtml`
  - `templates/components/api/azcom-json-sidebar-tags.mtml`
- Shared shells:
  - `templates/components/article/azcom-article-list-shell.mtml`
  - `templates/components/article/azcom-article-sidebar-shell.mtml`
  - `templates/components/article/azcom-article-prev-next-shell.mtml`

### 3.2 Reuse with minimal extension

- `templates/components/shared/azcom-member-config.mtml`
  - add `support_blog_id` while keeping `news_blog_id`
- `templates/components/api/azcom-article-query-member.mtml`
  - add optional flag to control newsletter exception:
    - `member_include_newsletter` default `1` (backward-compatible for News)
    - for Support endpoints set `member_include_newsletter=0`
- `templates/components/api/azcom-json-sidebar-ranking-entry.mtml`
  - make newsletter exception controllable by section:
    - add `ranking_include_newsletter` default `1`
    - set `0` for Support, keep `1` for News

### 3.3 New wiring templates only (Support-specific)

All Support pages/APIs are thin wrappers around shared components and vars.

---

## 4. File Plan

## 4.1 New files

### Blog pages
- `blog/support/index.mtml`
- `blog/support/detail.mtml`
- `blog/support/category.mtml`
- `blog/support/tag.mtml`
- `blog/support/api-member-detail.mtml`

### Corporate APIs
- `templates/api/api-support-list.mtml`
- `templates/api/api-support-sidebar.mtml`

### Member APIs
- `templates/api/api-member-support-list.mtml`
- `templates/api/api-member-support-latest.mtml`
- `templates/api/api-member-support-ranking.mtml`
- `templates/api/api-member-support-sidebar.mtml`

## 4.2 Modified files

- `templates/components/shared/azcom-member-config.mtml`
- `templates/components/api/azcom-article-query-member.mtml`
- `templates/components/api/azcom-json-sidebar-ranking-entry.mtml`
- `docs/superpowers/specs/2026-04-24-support-screen-design.md` (this file)

---

## 5. URL / Endpoint Specification

## 5.1 Corporate Site (Support blog root)

- `/support/api/support-list.json`
- `/support/api/support-sidebar.json`

## 5.2 Member Site (Support blog root)

- `/support/api/support.json`
- `/support/api/support/post_{id}.json`
- `/support/api/support-latest.json`
- `/support/api/support-ranking.json`
- `/support/api/support-sidebar.json`

> Final public root may include prefix (e.g. `/renew/support/...`) depending on blog base URL in MT; filenames and relative output mappings above stay fixed.

---

## 6. Data Contract

Use same item shape currently adopted in News APIs (MT Data API v1-compatible extension):

```json
{
  "id": 123,
  "title": "...",
  "basename": "post_123",
  "permalink": "https://.../support/post_123/",
  "createdDate": "2026-04-24T10:00:00+09:00",
  "categories": ["Cost Reduction"],
  "tags": ["tag-a"],
  "blog": { "id": 30 },
  "thumbnail": "https://...",
  "excerpt": "..."
}
```

List payload:

```json
{ "totalResults": 42, "items": [ ... ] }
```

Detail payload adds:

```json
{ "body": "<html...>", "prev_post": {...}|null, "next_post": {...}|null }
```

Sidebar payload:

```json
{ "ranking": [...], "categories": [...], "tags": [...] }
```

---

## 7. Business Rules

## 7.1 Corporate visibility (Support)

Entry is visible when:
- `display_target = corporate` OR `both` OR empty (`""`)

No newsletter/category exception logic.

## 7.2 Member visibility (Support)

Entry is visible when:
- `display_target = member` OR `both`

No newsletter/category exception logic.

## 7.3 Category constraints (Support)

Allowed child category slugs are fixed to:
- `cost-reduction`
- `safety-and-accident-prevention`
- `recruitment-and-training`
- `business-support`
- `vehicle-and-infrastructure`
- `finance-and-leasing`
- `health-and-medical-support`
- `employee-benefits`

For sidebar categories and category archive routes, Support templates must only surface these slugs. If MT content introduces other child categories, they are ignored by Support API rendering.

---

## 8. Template Wiring Details

## 8.1 Support index page

`blog/support/index.mtml` follows News index structure with wiring changes:
- `article_list_endpoint = api/support-list.json`
- `article_sidebar_endpoint = api/support-sidebar.json`
- metadata, hero title, breadcrumb labels switched to Support copy.

## 8.2 Support category/tag pages

Use same client-side shells:
- category page sets `article_list_filter_category_label`
- tag page sets `article_list_filter_tag`
- both call Support list/sidebar endpoints.
- Support sidebar endpoint sets:
  - `include_newsletter=0`

## 8.3 Member detail template

`blog/support/api-member-detail.mtml` uses same loop-based prev/next strategy as News to honor custom visibility filter.

---

## 9. MT Admin Setup Order

1. Update module `azcom-member-config` with real IDs:
   - `news_blog_id`
   - `support_blog_id`
2. Create/Update shared modules in Website scope:
   - `azcom-article-query-member` (add `member_include_newsletter` switch)
   - `azcom-json-sidebar-ranking-entry` (add `ranking_include_newsletter` switch)
   - `azcom-json-sidebar-categories` (add `allowed_category_slugs` switch)
3. Create Support Corporate Index Templates in Support blog:
   - `API: Support List` -> `api/support-list.json`
   - `API: Support Sidebar` -> `api/support-sidebar.json`
4. Create Support Member Index Templates in Support blog:
   - `API Member: Support List` -> `api/support.json`
   - `API Member: Support Latest` -> `api/support-latest.json`
   - `API Member: Support Ranking` -> `api/support-ranking.json`
   - `API Member: Support Sidebar` -> `api/support-sidebar.json`
5. Create Support Member Archive Template:
   - `API Member: Support Detail` (Entry archive)
   - mapping `api/support/post_<$mt:EntryID$>.json`
6. Create/Update Support page templates (`index/detail/category/tag`).
7. Rebuild Support blog indexes + archives.

---

## 10. Verification Checklist

## 10.1 API shape & filters

- `GET <support>/api/support-list.json`
  - has `totalResults`, `items[]`
  - excludes `display_target=member` entries
- `GET <support>/api/support.json`
  - includes only `member|both`
- `GET <support>/api/support/post_<id>.json`
  - returns `body`, `prev_post`, `next_post`
  - prev/next follow same member filter
- `GET <support>/api/support-ranking.json`
  - max 5 items, no newsletter exception
- `GET <support>/api/support-sidebar.json`
  - keys `ranking/categories/tags`
  - category slugs only from fixed Support set

## 10.2 Page wiring

- `support/index` renders list + sidebar from Support endpoints.
- `support/category` and `support/tag` filters work client-side.
- `support/detail` prev/next links are consistent with list order/filter.

## 10.3 Regression

- Existing News endpoints and pages unchanged.
- `member_include_newsletter` defaults preserve current News behavior.

---

## 11. Risks and Mitigations

- **Risk:** shared module extension breaks News behavior.
  - **Mitigation:** new flags default to current News behavior (`include newsletter = 1`).
- **Risk:** Support category set drifts from content editor operations.
  - **Mitigation:** enforce allowed slug list in Support wiring/templates and QA checklist.
- **Risk:** endpoint naming collision if templates created in wrong blog scope.
  - **Mitigation:** all Support templates must be created in Support blog scope and validated by output preview.

---

## 12. Out of Scope

- Member-site Laravel implementation details beyond endpoint contract usage.
- New JS/CSS component development (reuse existing article stack).
- Introducing dynamic server runtime for MT templates.

---

## 13. Implementation Readiness

This design is ready for implementation planning with low ambiguity:
- approach locked,
- endpoint naming locked,
- Support category behavior locked,
- file and admin setup map complete.
