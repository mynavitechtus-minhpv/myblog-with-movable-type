---
name: mt-workflow-guard
description: Enforces Movable Type Docker workflow with strict asset synchronization and admin-setup escalation. Use when working on MT templates, MTML, CSS/JS assets, development-dev mapping, or when user requests frontend/template changes in this project.
---

# MT Workflow Guard

## Purpose

Keep all Movable Type work aligned with the project workflow:

1. Docker-based MT project.
2. Template tracking in `development-dev`.
3. Frontend source in `assets`.
4. Immediate and detailed escalation when Admin structures are needed.

## Non-Negotiable Rules

- Treat `assets` as source of truth for frontend files.
- After editing `assets/css/*` or `assets/js/*`, copy exact content to matching file in `development-dev/assets/*`.
- Do not auto-sync image files unless user explicitly asks.
- Never read or modify `.env` unless user explicitly allows it.
- Do not create markdown files unless user explicitly requests.

## Working Directories

- Frontend source: `assets`
- Git tracking mirror: `development-dev/assets`
- MT template tracking: `development-dev/pages`, `development-dev/templates`

## Strict Execution Flow

Use this checklist for every relevant task:

- [ ] Confirm the requested change scope (template, css/js, or both).
- [ ] Edit source files in `assets` first for css/js changes.
- [ ] Mirror exact css/js content to `development-dev/assets` counterpart.
- [ ] Update MTML templates in `development-dev` when template changes are requested.
- [ ] Validate links/paths in templates point to the configured Docker-accessible asset paths.
- [ ] If structural Admin entities are needed, stop and raise a detailed Admin setup request.

## Admin Escalation Protocol (Detailed)

When task requires new `CustomField`, `ContentType`, or `Template` in Admin, provide a detailed request with:

1. Proposed name.
2. Type (`CustomField` / `ContentType` / `Template`).
3. Scope (Website, Blog, ContentType, Entry, Category, etc.).
4. Full field schema:
   - field key
   - label
   - data type
   - required/optional
   - default value
   - notes/validation
5. MTML usage purpose.
6. MTML snippet example that consumes the field/content.
7. Safe implementation order in Admin to avoid missing dependencies.

## Output Style for Escalation

Use this format:

```markdown
## Admin setup required

### 1) [Entity Name]
- Type: ...
- Scope: ...
- Reason: ...

### 2) Field schema
- `field_key` | Label: ... | Type: ... | Required: ... | Default: ...

### 3) MTML usage
```mtml
...snippet...
```

### 4) Setup order
1. ...
2. ...
3. ...
```

## Guardrails While Implementing

- Prefer minimal, targeted changes.
- Preserve existing user edits; do not revert unrelated modifications.
- Keep code and templates maintainable and consistent.
- For this project conversation style, respond in Vietnamese.

## When To Apply This Skill

Apply automatically when user asks to:

- Edit MT templates or MTML.
- Change CSS/JS in this project.
- Sync `assets` and `development-dev/assets`.
- Implement frontend behavior tied to MT templates.
- Review whether Admin entities must be created first.
