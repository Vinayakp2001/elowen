# Requirements Document

## Introduction

Migrate the content management layer of the luxury jewelry e-commerce site (`apps/web`) from Sanity CMS to Payload CMS v3. Payload runs embedded inside Next.js App Router (no separate service), uses SQLite locally via `@payloadcms/db-sqlite`, and exposes an admin panel at `localhost:3000/admin`. The migration replaces `lib/sanity/` with `lib/payload/` — a new query layer using Payload's Local API (direct DB calls, no HTTP). All UI components, the FastAPI backend, Zustand stores, and page routes remain unchanged. The Sanity folder and dependencies are removed once migration is complete.

---

## Requirements

### Requirement 1 — Payload CMS v3 Installation and Configuration

**User Story:** As a developer, I want Payload CMS v3 installed inside `apps/web` running as a Next.js plugin, so that a single `npm run dev` starts both the frontend and the admin panel.

#### Acceptance Criteria

1. WHEN Payload is installed THEN the system SHALL add `payload`, `@payloadcms/next`, `@payloadcms/richtext-lexical`, and `@payloadcms/db-sqlite` as dependencies in `apps/web/package.json`.
2. WHEN `payload.config.ts` is created THEN the system SHALL place it at `apps/web/payload.config.ts` with the SQLite adapter, Lexical rich text editor, and all collections registered.
3. WHEN `next.config.ts` is updated THEN the system SHALL wrap the existing Next.js config with `withPayload()` from `@payloadcms/next`.
4. WHEN the dev server starts THEN the system SHALL serve the Payload admin UI at `http://localhost:3000/admin`.
5. WHEN `PAYLOAD_SECRET` is needed THEN the system SHALL read it from `.env.local` as a required environment variable.
6. WHEN the database file is created THEN the system SHALL store it as `payload.db` at the project root of `apps/web`.
7. WHEN the app directory is configured THEN the system SHALL add Payload's catch-all route handler at `apps/web/app/(payload)/` following Payload v3 Next.js integration conventions.

---

### Requirement 2 — Payload Collections Mirroring Sanity Schemas

**User Story:** As a content editor, I want to manage all product, collection, category, homepage, and policy content in Payload admin, so that I can update the site without touching code.

#### Acceptance Criteria

1. WHEN a `Products` collection is defined THEN the system SHALL include fields: title, slug (auto-generated), price (number), compareAtPrice (number, optional), images (array of uploads), materials (array of text), options (array of objects: name + values), description (Lexical rich text), craftsmanship (Lexical rich text), isNew (boolean), isFeatured (boolean), inStock (boolean), category (relationship), collection (relationship).
2. WHEN a `Categories` collection is defined THEN the system SHALL include fields: title, slug, image (upload).
3. WHEN a `Collections` collection is defined THEN the system SHALL include fields: title, slug, heroImage (upload), description (text), products (relationship array to Products).
4. WHEN a `Pages` collection (or global) is defined for homepage settings THEN the system SHALL include fields: hero (object with headline, subline, ctaLabel, ctaHref, image), featuredCategories (relationship array), signatureProducts (relationship array), campaignBanner (object with image, headline, ctaLabel, ctaHref), featuredProducts (relationship array), brandStory (object with image, headline, body as Lexical), newsletterHeadline (text).
5. WHEN a `Policies` collection is defined THEN the system SHALL include fields: title, slug, body (Lexical rich text).
6. WHEN collections are configured THEN the system SHALL set appropriate access controls (read: public, write: authenticated admin only).

---

### Requirement 3 — Payload Local API Query Layer

**User Story:** As a developer, I want a `lib/payload/` query module that mirrors the existing `lib/sanity/queries.ts` interface, so that pages can switch data sources with minimal changes.

#### Acceptance Criteria

1. WHEN `lib/payload/queries.ts` is created THEN the system SHALL export the same function signatures as `lib/sanity/queries.ts`: `getHomepageSettings()`, `getProductBySlug(slug)`, `getAllCollections()`, `getCollectionBySlug(slug)`, `getPolicyBySlug(slug)`, `getAllPolicySlugs()`, `getAllCategories()`, `getFeaturedProducts()`.
2. WHEN queries are executed THEN the system SHALL use Payload's Local API (`getPayload({ config })`) for direct database access with no HTTP overhead.
3. WHEN image fields are returned THEN the system SHALL return a consistent image shape `{ url: string, alt?: string }` that matches what existing components expect.
4. WHEN a query returns no results THEN the system SHALL return `null` or an empty array, matching current behavior.
5. WHEN queries run in server components THEN the system SHALL be importable only from server-side code (no `'use client'` context).

---

### Requirement 4 — Image Handling

**User Story:** As a developer, I want image URLs from Payload uploads to work with existing Next.js `<Image>` components, so that no component changes are needed for images.

#### Acceptance Criteria

1. WHEN images are uploaded to Payload THEN the system SHALL store them in `apps/web/public/media/` and serve them at `/media/[filename]`.
2. WHEN `lib/payload/image.ts` is created THEN the system SHALL export a `getImageUrl(image)` helper that returns the public URL of a Payload upload.
3. WHEN `next.config.ts` is updated THEN the system SHALL allow the `localhost` hostname (and any production domain) in `images.remotePatterns` if needed.
4. WHEN existing page components call `urlFor(image).width(x).url()` THEN the system SHALL replace those calls with `getImageUrl(image)` from the new Payload image helper.

---

### Requirement 5 — Page Route Updates

**User Story:** As a developer, I want all existing page routes to use the new Payload query layer instead of Sanity, so that the site renders content from the local SQLite database.

#### Acceptance Criteria

1. WHEN `app/page.tsx` (homepage) is updated THEN the system SHALL import from `lib/payload/queries` instead of `lib/sanity/queries` and `lib/payload/image` instead of `lib/sanity/image`.
2. WHEN `app/products/[slug]/page.tsx` is updated THEN the system SHALL use Payload queries and Payload image helpers.
3. WHEN `app/collections/page.tsx` and `app/collections/[slug]/page.tsx` are updated THEN the system SHALL use Payload queries.
4. WHEN `app/policies/[slug]/page.tsx` is updated THEN the system SHALL use Payload queries and render Payload Lexical rich text.
5. WHEN `app/about/page.tsx` is updated THEN the system SHALL reflect the Payload data source.
6. WHEN pages use `revalidate` or caching THEN the system SHALL maintain the existing caching strategy (or use Payload's built-in ISR support).

---

### Requirement 6 — Rich Text Rendering

**User Story:** As a developer, I want Payload Lexical rich text to render correctly in policy pages and product descriptions, so that editors can write formatted content.

#### Acceptance Criteria

1. WHEN a `RichText` component is created THEN the system SHALL use `@payloadcms/richtext-lexical/react` to render Lexical content.
2. WHEN policy body is rendered THEN the system SHALL use the `RichText` component in `app/policies/[slug]/page.tsx`.
3. WHEN product description or craftsmanship content is rendered THEN the system SHALL use the `RichText` component.
4. WHEN the `RichText` component renders headings and paragraphs THEN the system SHALL apply the existing luxury brand typography classes.

---

### Requirement 7 — Remove Sanity Dependencies

**User Story:** As a developer, I want all Sanity-related code and dependencies removed after the Payload migration is complete, so that the codebase is clean and there are no unused packages.

#### Acceptance Criteria

1. WHEN Sanity is removed THEN the system SHALL delete `apps/web/sanity/` directory.
2. WHEN Sanity is removed THEN the system SHALL delete `apps/web/lib/sanity/` directory.
3. WHEN Sanity is removed THEN the system SHALL remove `sanity`, `next-sanity`, and `@sanity/image-url` from `package.json` dependencies.
4. WHEN Sanity env vars are present THEN the system SHALL remove `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` references from code and `.env.local.example`.
5. WHEN Sanity is removed THEN the system SHALL add `PAYLOAD_SECRET` to `.env.local.example` with a placeholder value.

---

### Requirement 8 — Developer Experience

**User Story:** As a developer, I want clear setup instructions so that anyone cloning the repo can get Payload running locally with minimal friction.

#### Acceptance Criteria

1. WHEN the project is set up THEN the developer SHALL only need to run `npm install` and set `PAYLOAD_SECRET` in `.env.local` to start.
2. WHEN `npm run dev` is run THEN the system SHALL start Next.js with Payload embedded — no separate process needed.
3. WHEN the admin panel is first visited at `localhost:3000/admin` THEN Payload SHALL prompt for account creation on first use.
4. WHEN the SQLite database does not exist THEN Payload SHALL create `payload.db` automatically on first startup.
5. WHEN `.gitignore` is checked THEN the system SHALL ensure `payload.db` and `apps/web/public/media/` uploads are gitignored.
