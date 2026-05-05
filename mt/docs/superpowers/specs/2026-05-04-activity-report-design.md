# Activity-Report Screen — Design Spec
**Date:** 2026-05-04  
**Version:** 1.0.0  
**Scope:** Corporate + Member APIs and pages for Activity-Report blog  
**Approach:** Copy-and-Wire from Support (reuse-first)

---

## 1. Objective

Implement Activity-Report (活動報告) screen and APIs by copying Support structure and reusing shared modules. Activity-Report follows the same simple pattern as Support:

- No newsletter exception logic
- Categories are dynamic from MT data
- CustomFields same as News/Support (`thumbnail`, `display_target`, `ranking_enabled`, `meta_description`)
- Both Corporate and Member endpoints

---

## 2. Confirmed Decisions

1. Activity-Report blog **already exists** in MT Cloud.
2. Implement **both** Corporate and Member APIs.
3. CustomFields: **same as News/Support**.
4. Categories: **dynamic from MT** (no fixed list).
5. Exception logic: **none** (same as Support).
6. Display name: **活動報告**
7. Endpoint naming follows **parallel pattern** with News/Support.

---

## 3. Reuse Strategy

### 3.1 Reuse without changes (100% shared)

- **JS/CSS:** `api-client.js`, `article-list.js`, `article-sidebar.js`, `article-prev-next.js`, all article CSS
- **MTML modules:**
  - `azcom-json-article-item.mtml`
  - `azcom-json-sidebar-categories.mtml`
  - `azcom-json-sidebar-tags.mtml`
  - `azcom-json-sidebar-ranking.mtml`
  - `azcom-json-sidebar-ranking-entry.mtml`
  - `azcom-article-list-shell.mtml`
  - `azcom-article-sidebar-shell.mtml`
  - `azcom-article-prev-next-shell.mtml`
  - `azcom-article-query-member.mtml`

### 3.2 Extend shared config

- `azcom-member-config.mtml` — add `activity_blog_id`

### 3.3 New wiring templates (Activity-Report specific)

All are thin wrappers around shared components.

---

## 4. File Plan

### 4.1 New files

#### Blog pages (blog/activity-report/)
| File | MT Template Type | Description |
|------|------------------|-------------|
| `index.mtml` | Index | Main list page |
| `detail.mtml` | Entry Archive | Article detail |
| `category.mtml` | Category Archive | Category filter page |
| `api-member-detail.mtml` | Entry Archive | Member detail JSON |

#### Corporate APIs (templates/api/)
| File | MT Template Type | Output Path |
|------|------------------|-------------|
| `api-activity-report-list.mtml` | Index | `api/activity-report-list.json` |
| `api-activity-report-sidebar.mtml` | Index | `api/activity-report-sidebar.json` |

#### Member APIs (templates/api/)
| File | MT Template Type | Output Path |
|------|------------------|-------------|
| `api-member-activity-report-list.mtml` | Index | `api/member/activity-report.json` |
| `api-member-activity-report-latest.mtml` | Index | `api/member/activity-report-latest.json` |
| `api-member-activity-report-ranking.mtml` | Index | `api/member/activity-report-ranking.json` |
| `api-member-activity-report-sidebar.mtml` | Index | `api/member/activity-report-sidebar.json` |

### 4.2 Modified files

- `templates/components/shared/azcom-member-config.mtml` — add `activity_blog_id`

---

## 5. URL / Endpoint Specification

### 5.1 Corporate Site (Activity-Report blog root)

| Endpoint | Description |
|----------|-------------|
| `api/activity-report-list.json` | All entries for corporate display |
| `api/activity-report-sidebar.json` | Sidebar data (ranking, categories, tags) |

### 5.2 Member Site (Activity-Report blog root)

| Endpoint | Description |
|----------|-------------|
| `api/member/activity-report.json` | All entries for member display |
| `api/member/activity-report/post_{id}.json` | Single entry detail |
| `api/member/activity-report-latest.json` | Latest N entries |
| `api/member/activity-report-ranking.json` | Top 5 ranking entries |
| `api/member/activity-report-sidebar.json` | Sidebar aggregate |

> Public paths will be prefixed by blog URL (e.g., `/renew/activity-report/api/...`)

---

## 6. Data Contract

Same as News/Support (MT Data API v1-compatible):

```json
// List payload
{
  "totalResults": 42,
  "items": [
    {
      "id": 123,
      "title": "...",
      "basename": "post_123",
      "permalink": "https://.../activity-report/post_123/",
      "createdDate": "2026-05-04T10:00:00+09:00",
      "categories": ["Category Label"],
      "tags": ["tag-a"],
      "blog": { "id": 40 },
      "thumbnail": "https://...",
      "excerpt": "..."
    }
  ]
}

// Detail payload adds:
{
  "body": "<html...>",
  "prev_post": {...} | null,
  "next_post": {...} | null
}

// Sidebar payload:
{
  "ranking": [...],
  "categories": [...],
  "tags": [...]
}
```

---

## 7. Business Rules

### 7.1 Corporate visibility

Entry visible when:
- `display_target = corporate` OR `both` OR empty (`""`)

### 7.2 Member visibility

Entry visible when:
- `display_target = member` OR `both`

### 7.3 No exception logic

Unlike News, Activity-Report does **not** have newsletter category exception.

---

## 8. Template Wiring Details

### 8.1 Index page

`blog/activity-report/index.mtml`:
- `article_list_endpoint = api/activity-report-list.json`
- `article_sidebar_endpoint = api/activity-report-sidebar.json`
- Hero title: `活動報告`
- Breadcrumb: トップ → 活動報告一覧

### 8.2 Detail page

`blog/activity-report/detail.mtml`:
- Sidebar endpoint: `api/activity-report-sidebar.json`
- Prev/Next via `azcom-article-prev-next-shell`
- Breadcrumb: トップ → 活動報告一覧 → {EntryTitle}

### 8.3 Category page

`blog/activity-report/category.mtml`:
- Same list endpoint with `data-filter-category-label`
- Breadcrumb: トップ → 活動報告一覧 → {CategoryLabel}

### 8.4 Member detail API

`blog/activity-report/api-member-detail.mtml`:
- Same loop-based prev/next strategy as Support
- No newsletter exception in visibility filter

---

## 9. MT Admin Setup Order

1. **Update shared module** `azcom-member-config`:
   - Add `activity_blog_id` with real ID from MT Cloud

2. **Create Corporate Index Templates** in Activity-Report blog:
   - `API: Activity Report List` → `api/activity-report-list.json`
   - `API: Activity Report Sidebar` → `api/activity-report-sidebar.json`

3. **Create Member Index Templates** in Activity-Report blog:
   - `API Member: Activity Report List` → `api/member/activity-report.json`
   - `API Member: Activity Report Latest` → `api/member/activity-report-latest.json`
   - `API Member: Activity Report Ranking` → `api/member/activity-report-ranking.json`
   - `API Member: Activity Report Sidebar` → `api/member/activity-report-sidebar.json`

4. **Create Member Archive Template**:
   - `API Member: Activity Report Detail` (Entry archive)
   - Mapping: `api/member/activity-report/post_%E.json`

5. **Create Page Templates**:
   - `index` (Index template)
   - `detail` (Entry archive) → `post_%E/index.html`
   - `category` (Category archive) → `%C/index.html`

6. **Setup CustomFields** (if not already):
   - `thumbnail`, `display_target`, `ranking_enabled`, `meta_description`

7. **Rebuild** Activity-Report blog (indexes + archives)

---

## 10. Verification Checklist

### 10.1 API shape & filters

- [ ] `GET api/activity-report-list.json` — has `totalResults`, `items[]`, excludes `display_target=member`
- [ ] `GET api/member/activity-report.json` — includes only `member|both`
- [ ] `GET api/member/activity-report/post_{id}.json` — returns `body`, `prev_post`, `next_post`
- [ ] `GET api/member/activity-report-ranking.json` — max 5 items
- [ ] `GET api/member/activity-report-sidebar.json` — keys `ranking/categories/tags`

### 10.2 Page wiring

- [ ] `/activity-report/` renders list + sidebar
- [ ] `/activity-report/{category}/` filters by category client-side
- [ ] `/activity-report/?tag=TagName` filters by tag client-side
- [ ] `/activity-report/post_{id}/` shows detail with sidebar + prev/next

### 10.3 Regression

- [ ] Existing News endpoints unchanged
- [ ] Existing Support endpoints unchanged

---

## 11. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Wrong blog scope for templates | All Activity-Report templates must be created in Activity-Report blog scope |
| Missing CustomFields | Verify CF setup before first rebuild |
| Endpoint naming collision | Use distinct `activity-report-*` prefix |

---

## 12. Out of Scope

- Member-site Laravel implementation
- New JS/CSS components
- Dynamic server runtime

---

## 13. Implementation Readiness

This design is ready for implementation:
- ✅ Approach locked (copy from Support)
- ✅ Endpoint naming locked
- ✅ File list complete
- ✅ MT Admin setup order defined
