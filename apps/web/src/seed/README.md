# Payload CMS Seed

Idempotent seed script that populates every Payload collection and the
homepage global the Elowen storefront depends on. Safe to re-run — every
document is matched by its unique `slug` (or `email` for users), and the
homepage global is overwritten in place, so repeat runs never create
duplicates.

## What it seeds

users, media, categories, collections, products, nav-items, policies, and the
`homepage-settings` global — with relationships wired between them (products →
categories, collections/nav-items → products, homepage → categories/products).

## Local

Run from `apps/web` (the Payload CLI needs the config + tsconfig that live
here — running from the repo root fails with a tsconfig error):

```bash
cd apps/web

# 1. Ensure the dev Postgres is up and schema is applied
#    (see .kiro/steering/project-context.md → Local Development Setup)
npx payload migrate

# 2. Run the seed. Admin env vars are optional — if omitted, the admin user
#    is skipped (with a warning) and the rest of the content still seeds.
SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD=yourpassword npm run seed
```

The script prints a per-collection created-vs-reused-vs-failed summary and
exits 0 on success, non-zero on a fatal error. Running it a second time should
show every row as "reused" with identical counts.

## Placeholder assets

The images under `assets/` are committed placeholders so the seed needs no
network access. To regenerate them (e.g. after adding a new media entry to
`data/media.ts`), run once from `assets/`:

```bash
node generate-placeholders.mjs
```

Replace any placeholder with a real image of the same filename to ship proper
artwork — the seed uploads whatever file is present.

## Production (one-shot, mirrors the migrator pattern)

Seeding production is a **deliberate manual operator step. It is NOT part of
the automatic CI/CD deploy** — wiring it into every push would re-run it on
each deploy. Run it once, on demand, against the **migrator** image on the same
Docker network the app uses (`elowen_elowen_net`).

> Use the `elowen-web-migrator` image, NOT `elowen-web`. The runner image is a
> Next.js standalone build and does not contain the Payload CLI, the config, or
> the seed sources. The migrator image carries the full `node_modules`,
> `payload.config.ts`, and `src/seed/` (see `apps/web/Dockerfile`).

```bash
cd /opt/elowen
docker run --rm --env-file .env --network elowen_elowen_net \
  -e SEED_ADMIN_EMAIL=you@example.com \
  -e SEED_ADMIN_PASSWORD=yourpassword \
  ghcr.io/vinayakp2001/elowen-web-migrator:latest \
  node_modules/.bin/payload run src/seed/index.ts
```

Because the seed is idempotent, re-running it on production is safe — existing
content is reused, not duplicated.
