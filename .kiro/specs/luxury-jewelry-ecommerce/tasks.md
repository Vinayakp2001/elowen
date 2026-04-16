# Implementation Plan

- [x] 1. Monorepo scaffold and project setup




  - Initialize monorepo root with `apps/web`, `apps/api`, `packages/shared` directories
  - Create `apps/web` as Next.js 14 App Router project with TypeScript
  - Create `apps/api` as FastAPI project with virtual environment and `requirements.txt`
  - Add root-level `.gitignore` covering `.env`, `__pycache__`, `.next`, `node_modules`
  - _Requirements: 14.1, 14.5_

- [x] 2. Design system and global styles



- [x] 2.1 Configure Tailwind with luxury brand tokens



  - Write `tailwind.config.ts` with full color palette (ivory, cream, champagne, sand, taupe, charcoal, gold), typography scale, container widths, border radius, and shadow tokens
  - Add Google Fonts import for Cormorant Garamond and DM Sans in `globals.css`
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2.2 Set up shadcn/ui with luxury overrides



  - Initialize shadcn/ui in `apps/web`
  - Override Button, Input, Sheet, Accordion, Toast styles to match luxury tokens
  - _Requirements: 1.6_

- [x] 2.3 Implement global reduced-motion CSS rule

  - Add `@media (prefers-reduced-motion: reduce)` block to `globals.css`
  - _Requirements: 13.5_

- [ ]* 2.4 Write unit tests for design token values
  - Verify color token keys exist in Tailwind config output
  - _Requirements: 1.1_

- [x] 3. App shell — layout, header, and footer



- [x] 3.1 Build `RootLayout` with font providers and metadata defaults


  - Create `app/layout.tsx` with font variables, Zustand provider wrapper, and base metadata
  - _Requirements: 2.2, 12.2_

- [x] 3.2 Build `SiteHeader` component


  - Desktop nav with logo, nav links, and icon group (Search, Account, Wishlist, Cart)
  - Scroll behavior: transparent to ivory background (200ms transition)
  - _Requirements: 3.1, 3.2_

- [x] 3.3 Build `NavMobile` hamburger drawer


  - Hamburger icon opens full-screen slide-in drawer with all nav links
  - _Requirements: 3.3_

- [x] 3.4 Build `CartDrawer` slide-in panel


  - Radix Sheet sliding from right (350ms), wired to Zustand cart store
  - Show CartItem list, subtotal, checkout CTA, and empty state
  - _Requirements: 3.4, 7.1, 7.2, 7.5_

- [x] 3.5 Build `SearchOverlay` full-width modal


  - Full-width search overlay triggered by search icon
  - _Requirements: 3.5_

- [x] 3.6 Build `SiteFooter` component


  - Policy links, social links, brand tagline, and navigation links
  - _Requirements: 4.9_

- [x] 4. Zustand stores — cart and wishlist


- [x] 4.1 Implement cart store


  - Create `lib/store/cart.ts`: add, remove, update quantity, clear, localStorage persistence for guests
  - _Requirements: 7.3, 7.4, 7.6_

- [x] 4.2 Implement wishlist store


  - Create `lib/store/wishlist.ts`: toggle item, localStorage persistence for guests
  - _Requirements: 8.1, 8.2_

- [ ]* 4.3 Write unit tests for cart store logic
  - Test add, remove, quantity update, and total calculation
  - _Requirements: 7.3, 7.4_

- [ ] 5. Sanity CMS setup and schemas
- [ ] 5.1 Configure Sanity project and client
  - Create `sanity.config.ts` and `lib/sanity/client.ts` with project ID, dataset, API version
  - Set up `@sanity/image-url` builder in `lib/sanity/image.ts`
  - _Requirements: 10.1_

- [ ] 5.2 Write Sanity schemas
  - Implement schemas for: `product`, `category`, `collection`, `homepageSettings`, `policy`, `editorialQuote`
  - _Requirements: 10.1, 10.2, 10.3, 10.5, 10.6_

- [ ] 5.3 Write GROQ query library
  - Create `lib/sanity/queries.ts` with typed queries for: homepage settings, product by slug, collection by slug, all collections, policy by slug, featured products
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 6. Homepage sections
- [ ] 6.1 Build `HeroSection` component
  - Full-viewport editorial image, serif headline, subline, ghost CTA
  - Fade-in + translateY entry animation (400ms), respects reduced-motion
  - _Requirements: 4.2_

- [ ] 6.2 Build `FeaturedCategories` section
  - 4-col desktop / 2-col mobile grid of `CategoryTile` components
  - Hover crossfade transition (300ms) on each tile
  - _Requirements: 4.3_

- [ ] 6.3 Build `SignatureCollection` section
  - Asymmetric 2-col: large editorial image left, 2 product feature cards right
  - _Requirements: 4.4_

- [ ] 6.4 Build `CampaignBanner` component
  - Full-width image, dark overlay, centered serif headline, CTA button
  - _Requirements: 4.5_

- [ ] 6.5 Build `ProductHighlights` section
  - 4-col desktop / 2-col mobile grid using `ProductCard` components
  - _Requirements: 4.6_

- [ ] 6.6 Build `BrandStory` section
  - 50/50 split: editorial image left, serif headline + body copy right
  - _Requirements: 4.7_

- [ ] 6.7 Build `NewsletterCapture` section
  - Centered minimal layout, brand headline, email input form
  - On submit, call `POST /newsletter/subscribe`
  - _Requirements: 4.8_

- [ ] 6.8 Wire homepage to Sanity data
  - Fetch `homepageSettings` in `app/page.tsx` as server component, pass to all section components
  - _Requirements: 10.3_

- [ ] 7. ProductCard component
  - Primary image, hover swap to secondary (300ms crossfade), name, price, WishlistButton toggle
  - LoadingSkeleton shimmer variant for loading state
  - _Requirements: 5.3, 5.4_

- [ ] 8. Collection page
- [ ] 8.1 Build `CollectionHero` component
  - Full-width banner with collection title overlaid on editorial image
  - _Requirements: 5.1_

- [ ] 8.2 Build `FilterBar` and `FilterDrawer`
  - Desktop: inline filter controls (material, price range, availability) + sort select
  - Mobile: "Filter" button triggers slide-up FilterDrawer
  - _Requirements: 5.2, 5.5, 5.7_

- [ ] 8.3 Build collection page with product grid and load more
  - `app/collections/[slug]/page.tsx` as server component fetching from Sanity
  - ProductGrid with ProductCard, "Load More" button appending next batch
  - _Requirements: 5.2, 5.3, 5.6_

- [ ] 9. Product detail page
- [ ] 9.1 Build `ProductGallery` component
  - Desktop: main image + thumbnail strip with click-to-swap
  - Mobile: swipeable image carousel
  - _Requirements: 6.1, 6.2_

- [ ] 9.2 Build `ProductOptions` selector
  - Option groups (metal, size, stone) as button grids with clear selected state
  - _Requirements: 6.3_

- [ ] 9.3 Build `AddToCartButton` with stock validation
  - On click: call `POST /cart/validate`, add to Zustand store, open CartDrawer
  - Disabled "Sold Out" state when inStock is false
  - _Requirements: 6.4_

- [ ] 9.4 Build `EditorialAccordion` for product info sections
  - Collapsible accordion for: Product Story, Materials & Craftsmanship, Shipping & Returns
  - _Requirements: 6.5, 6.6, 6.7_

- [ ] 9.5 Build `RelatedProducts` horizontal scroll
  - 4 related ProductCard components in a horizontal scroll container
  - _Requirements: 6.8_

- [ ] 9.6 Build `StickyCartBar` for mobile
  - Fixed bottom bar, mobile only, with product name, price, and Add to Cart
  - _Requirements: 6.9_

- [ ] 9.7 Wire product detail page to Sanity data
  - `app/products/[slug]/page.tsx` as server component with JSON-LD Product schema markup
  - _Requirements: 10.6, 12.1_

- [ ] 10. FastAPI backend setup
- [ ] 10.1 Initialize FastAPI app with config and database
  - `app/main.py` with FastAPI instance, CORS config, router registration
  - `app/config.py` with Pydantic BaseSettings for all env vars
  - `app/database.py` with SQLModel engine, session factory, startup hook
  - _Requirements: 11.6, 11.7_

- [ ] 10.2 Implement all SQLModel table models
  - Models in `app/models/` for: User, Cart, CartItem, Order, OrderItem, Payment, Coupon, NewsletterSignup, Wishlist, WishlistItem, WebhookEvent
  - _Requirements: 11.6_

- [ ] 10.3 Implement health router
  - `app/routers/health.py` with `GET /health` returning status and version
  - _Requirements: 11.1_

- [ ] 11. Cart validation and checkout
- [ ] 11.1 Implement `cart_service` and cart router
  - `app/services/cart_service.py` with `validate_cart(items)` checking stock and price
  - `app/routers/cart.py` with `POST /cart/validate` and `POST /cart/coupon`
  - _Requirements: 11.2_

- [ ] 11.2 Implement `stripe_service` and checkout router
  - `app/services/stripe_service.py` with `create_checkout_session(items, coupon, urls)`
  - `app/routers/checkout.py` with `POST /checkout/session`, attaching order metadata
  - _Requirements: 11.3, 9.1, 9.2_

- [ ] 11.3 Implement `coupon_service`
  - `app/services/coupon_service.py` with `validate_coupon(code, subtotal)` checking active, expiry, max uses
  - _Requirements: 9.7_

- [ ]* 11.4 Write pytest tests for cart and coupon service logic
  - Test price validation, out-of-stock detection, coupon expiry, discount calculation
  - _Requirements: 11.2, 9.7_

- [ ] 12. Stripe webhook processing
- [ ] 12.1 Implement webhook router
  - `app/routers/webhooks.py` with `POST /webhooks/stripe`
  - Verify Stripe signature, check WebhookEvent table for idempotency, handle `checkout.session.completed`
  - _Requirements: 9.3, 9.6_

- [ ] 12.2 Implement `order_service`
  - `app/services/order_service.py` with `create_from_session(session)` creating Order, OrderItem, Payment records
  - _Requirements: 9.3_

- [ ]* 12.3 Write pytest integration tests for webhook endpoint
  - Use Stripe CLI fixture payloads to test signature verification and order creation
  - _Requirements: 9.6_

- [ ] 13. Orders, wishlist, and newsletter routers
- [ ] 13.1 Implement orders router
  - `app/routers/orders.py` with `GET /orders/{order_id}`
  - _Requirements: 9.4_

- [ ] 13.2 Implement wishlist router
  - `app/routers/wishlist.py` with `POST /wishlist` add/remove for authenticated users
  - _Requirements: 11.9, 8.3_

- [ ] 13.3 Implement newsletter router
  - `app/routers/newsletter.py` with `POST /newsletter/subscribe`, handle duplicate email gracefully
  - _Requirements: 11.8_

- [ ] 14. Checkout flow wiring (frontend)
- [ ] 14.1 Wire checkout button to FastAPI session creation
  - CartDrawer checkout button calls `POST /checkout/session` with cart items
  - On success, redirect to Stripe hosted checkout URL
  - _Requirements: 9.1, 9.2_

- [ ] 14.2 Build checkout success and cancel pages
  - `app/checkout/success/page.tsx`: fetch order via `GET /orders/{id}` using session_id, display confirmation
  - `app/checkout/cancel/page.tsx`: branded cancellation page with recovery CTA back to cart
  - _Requirements: 9.4, 9.5_

- [ ] 15. Wishlist page and backend sync
  - Build `app/wishlist/page.tsx` displaying all saved items with image, name, price, Add to Cart
  - When user is authenticated, sync wishlist actions to `POST /wishlist`
  - _Requirements: 8.3, 8.4, 8.5_

- [ ] 16. Policy and about pages
- [ ] 16.1 Build policy page
  - `app/policies/[slug]/page.tsx` fetching policy body from Sanity and rendering PortableText
  - _Requirements: 10.5_

- [ ] 16.2 Build about page
  - `app/about/page.tsx` with brand story content from Sanity
  - _Requirements: 2.1_

- [ ] 17. SEO and metadata
  - Add Next.js Metadata API exports to all page routes (title, description, OG tags)
  - Add JSON-LD Product schema to product detail pages
  - Add canonical tags to collection pages
  - Ensure all Next.js Image components have descriptive alt text
  - _Requirements: 12.1, 12.2, 12.3, 12.5, 12.6_

- [ ] 18. Branded 404 and error pages
  - Create `app/not-found.tsx` with branded 404 layout and CTA to homepage
  - Create `app/error.tsx` boundary with recovery CTA
  - _Requirements: 2