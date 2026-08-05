# Implementation Plan

- [x] 1. Install Payload CMS v3 dependencies






  - Add `payload`, `@payloadcms/next`, `@payloadcms/richtext-lexical`, and `@payloadcms/db-sqlite` to `apps/web/package.json`
  - Run `npm install` in `apps/web`
  - _Requirements: 1.1_

- [x] 2. Create Payload collection and global definitions


- [x] 2.1 Create Media collection


  - Write `apps/web/collections/Media.ts` with upload config pointing to `public/media/` and `alt` text field
  - _Requirements: 2.1, 4.1_


- [x] 2.2 Create Categories collection

  - Write `apps/web/collections/Categories.ts` with title, slug, and image (upload relationship) fields
  - _Requirements: 2.2_


- [x] 2.3 Create Collections collection

  - Write `apps/web/collections/Collections.ts` with title, slug, heroImage, description, and products (relationship) fields
  - _Requirements: 2.3_


- [x] 2.4 Create Products collection

  - Write `apps/web/collections/Products.ts` with all fields: title, slug, price, compareAtPrice, images array, category, collection, materials, options, description (richText), craftsmanship (richText), isNew, isFeatured, inStock
  - _Requirements: 2.1_


- [x] 2.5 Create Policies collection

  - Write `apps/web/collections/Policies.ts` with title, slug, and body (richText) fields
  - _Requirements: 2.5_



- [x] 2.6 Create HomepageSettings global
  - Write `apps/web/globals/HomepageSettings.ts` with all hero, featuredCategories, signatureProducts, campaignBanner, featuredProducts, brandStory, and newsletterHeadline fields
  - _Requirements: 2.4_

- [x] 3. Create `payload.config.ts` and wire up Next.js



- [x] 3.1 Write payload.config.ts
  - Create `apps/web/payload.config.ts` registering all collections and globals, configuring sqliteAdapter with `file:./payload.db`, lexicalEditor, and admin settings
  - _Requirements: 1.2, 1.5, 1.6_


- [x] 3.2 Update next.config.ts with withPayload

  - Wrap existing Next.js config export with `withPayload()` from `@payloadcms/next`
  - _Requirements: 1.3_


- [x] 3.3 Add Payload app router route handlers

  - Create `apps/web/app/(payload)/admin/[[...segments]]/page.tsx` and `not-found.tsx` with Payload admin views
  - Create `apps/web/app/(payload)/api/[...slug]/route.ts` with Payload REST route handlers
  - _Requirements: 1.4, 1.7_

- [x] 4. Create Payload query layer



- [x] 4.1 Write lib/payload/image.ts
  - Implement `getImageUrl(image)` helper that returns the public URL from a Payload upload object
  - _Requirements: 3.3, 4.2_


- [x] 4.2 Write lib/payload/queries.ts

  - Implement all query functions using Payload Local API: `getHomepageSettings()`, `getProductBySlug()`, `getAllCollections()`, `getCollectionBySlug()`, `getPolicyBySlug()`, `getAllPolicySlugs()`, `getAllCategories()`, `getFeaturedProducts()`
  - Include transform helpers that map Payload document shapes to the same data shapes existing components expect
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5. Create RichText component


  - Write `apps/web/components/ui/rich-text.tsx` wrapping `@payloadcms/richtext-lexical/react` with luxury brand typography classes applied to the container
  - _Requirements: 6.1, 6.4_

- [x] 6. Update page routes to use Payload


- [x] 6.1 Update homepage (app/page.tsx)

  - Replace `lib/sanity/queries` import with `lib/payload/queries`
  - Replace `urlFor(image).width(x).url()` calls with `getImageUrl(image)`
  - _Requirements: 5.1_


- [x] 6.2 Update product detail page

  - Replace Sanity imports in `app/products/[slug]/page.tsx` with Payload equivalents
  - Update image URL construction to use `getImageUrl()`
  - _Requirements: 5.2_


- [x] 6.3 Update collections pages

  - Replace Sanity imports in `app/collections/page.tsx` and `app/collections/[slug]/page.tsx`
  - _Requirements: 5.3_


- [x] 6.4 Update policy page with RichText

  - Replace Sanity imports in `app/policies/[slug]/page.tsx` with Payload equivalents
  - Replace PortableText renderer with `<RichText content={policy.body} />`
  - _Requirements: 5.4, 6.2_


- [x] 6.5 Update about page

  - Replace any Sanity imports in `app/about/page.tsx` with Payload equivalents
  - _Requirements: 5.5_

- [x] 7. Update product components for Lexical rich text


  - Update `components/commerce/editorial-accordion.tsx` to render product description and craftsmanship fields using `<RichText>` instead of Sanity PortableText
  - _Requirements: 6.3_

- [x] 8. Update environment variables and gitignore


  - Add `PAYLOAD_SECRET=your-random-secret-here` to `.env.local.example`
  - Remove Sanity env var entries from `.env.local.example`
  - Add `payload.db` and `public/media/` to `apps/web/.gitignore`
  - _Requirements: 1.5, 7.4, 7.5, 8.1, 8.5_

- [x] 9. Remove Sanity code and dependencies



  - Delete `apps/web/sanity/` directory
  - Delete `apps/web/lib/sanity/` directory
  - Remove `sanity`, `next-sanity`, and `@sanity/image-url` from `apps/web/package.json` dependencies
  - Run `npm install` to update lockfile
  - _Requirements: 7.1, 7.2, 7.3, 7.4_
