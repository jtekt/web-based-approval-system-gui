# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development server
npm run dev

# Build (runs type-check and vite build in parallel)
npm run build

# Type-check only
npm run type-check

# Lint
npm run lint

# Lint and auto-fix
npm run lint:fix
```

There are no automated tests in this project.

## Architecture

This is a Vue 3 + TypeScript SPA — a frontend for **Shinsei Manager**, a document approval workflow application (申請 = "application/request" in Japanese). Users submit applications based on templates, which then route through an ordered chain of recipients for approval or rejection.

### Stack

- **Vue 3** with Composition API (`<script setup>`)
- **Vuetify 4** (Material Design component library) — configured in `src/plugins/vuetify.ts`, shared with the other corporate-apps frontends (primary `#b00000`, dark `#b02222`)
- **Vue Router 5** — lazy-loaded routes, navigation guard handles auth
- **vue-i18n 11** — English/Japanese, configured in `src/plugins/i18n.ts` (shared with the other frontends), which also persists the locale in `localStorage`
- **axios** — single instance in `src/api.ts`, `baseURL` set to `VITE_SHINSEI_MANAGER_URL`
- **Zod** — runtime schema validation for API response types

### Environment variables

All env vars are validated at startup via Zod in `src/utils/env.ts`, which parses `src/runtimeEnv.ts` (build-time `import.meta.env` overridden by the runtime `window.__ENV__` from `/env.js`). Import `env` from there — never use `import.meta.env` directly elsewhere. The one exception is the displayed version: `VITE_APP_VERSION` is read from `import.meta.env` in `src/pages/About.vue` so it cannot be overridden at runtime. Required vars include service URLs for `VITE_SHINSEI_MANAGER_URL`, `VITE_EMPLOYEE_MANAGER_API_URL`, `VITE_GROUP_MANAGER_API_URL`, and auth endpoints.

### Authentication

Uses `@jtekt/vuetify-auth`

### Data flow

Pages make API calls directly using the `api` axios instance (no Vuex/Pinia). Shared UI feedback goes through `useToast()` from package `@jtekt/vue-feedback-kit`.

### Domain model

- **Template** — defines form fields and a list of manager/group owners
- **Application** — an instance submitted from a template; has `form_data` (JSON-serialized fields), an `applicant`, and an ordered list of `recipients`
- **Recipient** — a user in the approval chain with a `flow_index`; gains an `approval` or `refusal` object when they act
- **Hanko** — a digital seal stamp overlaid on a PDF at a specific page/position; stored per recipient approval

### PDF handling

When `VITE_PDF_ONLY=true`, applications can include file attachments. `PdfViewer.vue` and `pdf-lib` handle rendering and stamping hankos onto PDFs. The `WebHanko` / `WebHankoContainer` components manage the hanko UI.

### Internationalization

All user-facing strings must use `$t('...')` in templates or `t('...')` from `useI18n()` in scripts. Add new keys to both `src/locales/en.json` and `src/locales/ja.json`.

### Component organization

- `src/pages/` — route-level components
- `src/components/application/` — components used on the single-application view
- `src/components/new_application/` — components for the new/resubmit application flow
- `src/components/templates/` — template management components
- `src/composables/` — shared reactive logic (auth, toast, date utils)
- `src/schemas/` — Zod schemas; TypeScript types are inferred from them and re-exported from `src/types/index.ts`
