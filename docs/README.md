# OSCAR Fashion — Documentation

Central documentation for the OSCAR Fashion e-commerce monorepo. Each app keeps only its own `README.md`; everything else lives here.

## Subfolders

| Folder | Contents |
|---|---|
| [business/](./business/) | Project plan, commercial proposals, budgets, requirements (cahier des charges), vendor quote analysis |
| [specs/](./specs/) | Technical specifications — overall, frontend, backoffice, mobile, dashboard comparison |
| [planning/](./planning/) | Task checklists, per-app budgets, per-app calendars |
| [guides/](./guides/) | How-to guides — authentication, deployment (Railway), POS integration, security, mobile UI components, designer feedback |
| [status/](./status/) | Implementation status snapshots — frontend, mobile |
| [archive/](./archive/) | Superseded documents — V1 spec, mobile completion docs, HestiaCP deploy path |

## Related (kept outside /docs)

- [Root README](../README.md) — project overview, tech stack, getting started
- [CLAUDE.md](../CLAUDE.md) — Claude Code guidance
- [/deploy](../deploy/) — canonical deployment scripts and step-by-step operational guides (Caddy + PM2 on a single VPS)
- Each app's own `README.md`: [backend](../apps/backend/README.md), [backoffice](../apps/backoffice/README.md), [mobile](../apps/mobile/README.md)
