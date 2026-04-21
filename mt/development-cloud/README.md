# development-cloud — Cloud (MT Cloud) Templates

This folder contains **clean templates for MT Cloud** — direct CustomFields usage, no local bypass logic.

## Folder structure

```
development-cloud/
├── blog/
│   └── news/
│       ├── index.mtml       ← News list page
│       ├── category.mtml    ← Category list page
│       ├── tag.mtml         ← Tag list page
│       └── detail.mtml      ← Article detail page (uses CF meta_description)
└── templates/
    └── components/
        └── article/
            ├── azcom-article-card.mtml              ← uses <mt:EntryCustomField> directly
            ├── azcom-article-query-corporate.mtml   ← uses <mt:EntryCustomField> directly
            └── azcom-article-sidebar-ranking.mtml   ← uses <mt:EntryCustomField> directly
```

## What differs from development-dev/

| File | development-dev (local) | development-cloud (cloud) |
|---|---|---|
| `azcom-article-card.mtml` | uses `cf_thumbnail_url` variable + proxy | direct `<mt:EntryCustomField>` |
| `azcom-article-query-corporate.mtml` | uses `cf_display_target` variable + proxy | direct `<mt:EntryCustomField>` |
| `azcom-article-sidebar-ranking.mtml` | uses `cf_*` variables + proxy | direct `<mt:EntryCustomField>` |
| `blog/news/detail.mtml` | CF proxy for meta_description + env-config | direct `<mt:EntryCustomField>` |
| `blog/news/index.mtml` | has `<mt:Include module="azcom-env-config">` | no env-config include |
| `blog/news/category.mtml` | has `<mt:Include module="azcom-env-config">` | no env-config include |
| `blog/news/tag.mtml` | has `<mt:Include module="azcom-env-config">` | no env-config include |

## Files NOT in this folder (same for local and cloud)

These files are identical in both environments — use from `development-dev/`:

- `azcom-pagination.mtml`
- `azcom-article-sidebar.mtml`
- `azcom-article-prev-next.mtml`
- `azcom-article-cf-entry.mtml` ← also NOT needed on cloud (no proxy pattern here)
- `azcom-env-config.mtml` ← NOT needed on cloud (no feature flag needed)
- All CSS files

## Deploy checklist

### Local MT Admin (free MT, no CustomFields plugin)

Upload from `development-dev/`:
- [x] All template modules (Website level): `azcom-article-card`, `azcom-article-query-corporate`, `azcom-article-sidebar-ranking`, `azcom-article-sidebar`, `azcom-article-prev-next`, `azcom-pagination`
- [x] `azcom-env-config` (Website level) — sets `env_has_cf = 0`
- [ ] **Skip** `azcom-article-cf-entry` — do NOT create this on local
- [x] News blog templates: `index.mtml`, `category.mtml`, `tag.mtml`, `detail.mtml`

### MT Cloud (with CustomFields plugin)

Upload from `development-cloud/` (overrides dev where listed above):
- [x] Template modules (Website level): `azcom-article-card`, `azcom-article-query-corporate`, `azcom-article-sidebar-ranking` ← **from this folder**
- [x] Shared modules (Website level): `azcom-article-sidebar`, `azcom-article-prev-next`, `azcom-pagination` ← from `development-dev/`
- [ ] **Do NOT create** `azcom-env-config` (not needed)
- [ ] **Do NOT create** `azcom-article-cf-entry` (not needed — CF used directly)
- [x] News blog templates: `index.mtml`, `category.mtml`, `tag.mtml`, `detail.mtml` ← **from this folder**
