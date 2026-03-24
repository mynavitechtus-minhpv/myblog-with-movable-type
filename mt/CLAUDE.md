# CLAUDE.md

Hướng dẫn làm việc với project Movable Type 8.8.2 trên Docker.

## Cấu trúc Project

```
mt/
├── docker-compose.yml     # Container orchestration (app + db)
├── Dockerfile             # Custom Perl/Apache image
├── entrypoint.sh          # Startup script
├── Makefile               # Convenience commands
├── .env                   # Environment variables
├── .env.example           # Environment template
├── mt-config.cgi          # MT application config
├── CLAUDE.md              # File này
├── DEVELOPMENT.md         # Hướng dẫn triển khai chi tiết
├── README.md              # Project README
└── [MT source files]     # mt.cgi, mt-static/, plugins/, v.v.
```

## Common Commands

```bash
# Build & Start
docker compose build
docker compose up -d

# Stop
docker compose down

# Logs
docker compose logs -f

# Shell vào container
docker compose exec app bash

# Database CLI
docker compose exec db mysql -u mtuser -p mt_db
# Password: mtpassword
```

## URLs

| URL | Mục đích |
|-----|----------|
| http://localhost:8082/cgi-bin/mt/mt.cgi | MT Admin |
| http://localhost:8082/cgi-bin/mt/mt-check.cgi | System check |

## Database

- Database: `mt_db`
- User: `mtuser`
- Password: `mtpassword`
- Host: `db` (Docker internal)

## Development Notes

- Thư mục `mt/` được mount trực tiếp vào container - thay đổi phản ánh ngay lập tức
- Database chờ MariaDB healthy trước khi start Apache
- Background tasks tắt (`LaunchBackgroundTasks 0`) cho local dev
- Image driver: `Imager`

Xem `DEVELOPMENT.md` để biết hướng dẫn chi tiết.

---

## MT Component Patterns

- Naming convention must follow BEM-like format:
  - `.c-[component]`
  - `.c-[component]__element`
  - `.c-[component]--modifier`
- Button variants: Primary, Accent, Outline, Pill. Main navigation CTA prefers Pill.
- Header/Footer actions keep brand consistency; member button uses Pill style.
- Breadcrumb text style: `14px`, line-height `20px`, secondary text color.
- Label/Tag style: Helvetica, `16px`, bold, line-height `32px`.
- Pagination must distinguish clearly: number, prev, next; active uses Primary Blue.
- Floating CTA buttons default to Pill + subtle shadow for visibility.

### Reuse Principle

- Build reusable components before page-specific overrides.
- Keep card structure consistent: thumbnail, category, title, description, link.

---

## MT CSS Implementation Guardrails

- CSS architecture target: `base.css`, `layout.css`, `component.css`, `page.css`, `utility.css`.
- Mandatory: CSS variables/design tokens, reusable classes, PC/SP responsive handling.
- Forbidden: inline CSS, color hard-coding, fixed typography outside approved scale.
- Avoid inconsistent corner styles for same UI intent.
- Keep CTA ring/border effect via `box-shadow` or pseudo-element instead of thick border hacks.
- Do not overuse gradients on small components.

### Project Workflow Constraints

- Treat `assets` as source of truth for css/js edits.
- Mirror exact css/js content into `development-dev/assets` counterpart after each change.
- Do not auto-sync image files unless explicitly requested.
- If code conflicts with this rule, prioritize client guideline compliance.

---

## MTML Integration and Admin Escalation

- For template work, keep tracked template files in `development-dev` structure.
- Ensure template asset links follow project Docker path mapping.
- When adding dynamic blocks, align with MT data assumptions:
  - article cards: `title`, `category.name`, `thumbnail`, `excerpt`, `published_at`
  - pagination: `page_numbers`, `has_prev`, `has_next`
  - navigation: `page/category`
  - side menu: ranking (max 5), category list, tag list
- Content rendering wrappers should use `.mt-content` for article body styling.

### Mandatory Escalation

If implementation requires new Admin entities, provide detailed request for:
- `CustomField` / `ContentType` / `Template`
- name, scope, full field schema, validation, default value, MTML usage snippet, setup order
- pause dependent implementation until Admin setup dependency is acknowledged

---

## MT Admin Escalation Output Format

When implementation requires new Admin entities, respond with this exact structure and high detail.

### Required Sections

1. `Admin setup required` summary
2. Per-entity block (one block per `CustomField` / `ContentType` / `Template`)
3. Full field schema
4. MTML usage snippet
5. Setup order
6. Dependency and impact notes

### Output Template

```markdown
## Admin setup required

### 1) [Entity Name]
- Type: `CustomField` | `ContentType` | `Template`
- Scope: [Website/Blog/Entry/Category/ContentType/...]
- Purpose: [Why this entity is required]
- Dependency: [What feature waits on this setup]

### 2) Field schema
- `field_key`
  - Label: ...
  - Type: ...
  - Required: yes/no
  - Default: ...
  - Validation: ...
  - Notes: ...

### 3) MTML usage
```mtml
...realistic snippet using the field/content...
```

### 4) Setup order
1. Create ...
2. Configure ...
3. Link ...
4. Rebuild/verify ...

### 5) Impact and verification
- Affected templates: ...
- Backward compatibility: ...
- Verification checklist:
  - [ ] Data appears in expected template block
  - [ ] Empty-state behavior is safe
  - [ ] Existing pages are not broken
```

### Quality Bar

- Be concrete: avoid generic placeholders when real names are available.
- Include assumptions explicitly if data model is not yet finalized.
- If user has not created Admin entities yet, stop dependent implementation and ask for setup completion.

---

## MT Design Tokens

- Use tokenized colors only; avoid hard-coded color values in component styles.
- Primary: `#22326e`, `#1c64f2`, `#e8f0fe`, `#b9cffb`; Accent: `#df4661`, `#bc2630`.
- Neutrals: text `#424242/#757575`, white `#ffffff`, bg `#f5f7fa`, border `#e0e0e0`.
- Allowed gradients: blue `linear-gradient(to bottom right, #22326e, #1c64f2)` and red `linear-gradient(to right, #df4661, #bc2630)`.
- Base spacing scale uses 8px system with approved values `4, 8, 10, 16, 20, 24, 32, 40, 48, 60, 64, 80`.
- Border radius tokens only: `4px`, `8px`, `12px`, and pill `9999px`.

### Typography Rules

- Main font: Noto Sans JP. Secondary (labels/latin-numeric): Helvetica.
- Body default: `16px` with readable line-height (`1.6-1.75`).
- Enforce heading and body line-height ranges from the guideline.

---

## MT Layout and Responsive

- Use breakpoints exactly: Mobile `<768px`, Tablet `768px-1024px`, Desktop `>1024px`.
- Desktop widths: container `1440px`, content `1280px`, text-heavy content `1120px`.
- Mobile widths: design baseline `375px`, content `335px`, narrow readable zone `280px`.
- Prefer readability adjustments on SP by spacing and width, not aggressive font shrinking.
- Keep heading responsive scale: H1 `40->30`, H2 `32->26`, H3 `24->20`, H4 `20->18`.
- Section spacing responsive baseline: `64px -> 40px`, page padding `80px -> 20px`.

### Validation Checklist

- [ ] Chosen container/content width matches page context.
- [ ] SP layout uses approved mobile widths.
- [ ] Heading scale follows desktop/mobile mapping.
- [ ] Responsive behavior preserves readability first.