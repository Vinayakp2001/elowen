# Elowen CMS — Admin User Manual

## Getting Started

### Accessing the Admin Panel

Go to **https://elowen.co.in/admin** in your browser.

Log in with your email and password. If this is the very first time the site is set up, you'll be prompted to create the first admin account — fill in your email and a strong password, then save.

### The Dashboard Layout

Once logged in you'll see:

- **Left sidebar** — lists all collections (Products, Categories, Collections, Media, Nav Items, Policies, Users) and a Globals section (Homepage Settings)
- **Main area** — shows the list or edit view for whatever you've selected

Everything you need to manage the store is in the sidebar.

---

## Products

Products are the core of the store. Each product gets its own page on the storefront.

### Creating a Product

1. Click **Products** in the sidebar
2. Click **Create New** (top right)
3. Fill in the fields (see below)
4. Click **Save** when done

### Fields Explained

| Field | What it does |
|---|---|
| Title | Product name shown on the storefront. Required. |
| SKU | Stock keeping unit — your internal reference code. Optional. |
| Price | Selling price in rupees. Required. |
| Compare At Price | Original/crossed-out price — use this to show a discount. Leave blank if no discount. |
| Images | Upload one or more product photos. They appear in the gallery on the product page. |
| Category | Assign the product to a category (e.g. Rings, Necklaces). |
| Collection | Assign the product to a themed collection (e.g. Bridal, Summer). |
| Materials | Add material tags (e.g. 18K Gold, Sterling Silver). Click Add to add more. |
| Options | Product variants — see below. |
| Description | Main product description. Supports rich text (headings, bold, lists). |
| Craftsmanship | Details about how the piece is made. Supports rich text. |
| Is New | Check this to show a "New" badge on the product card. |
| Is Featured | Check this to include the product in featured sections on the homepage. |
| In Stock | Uncheck this to mark the product as unavailable/sold out on the storefront. |

> The **Slug** field is auto-generated from the title — you don't need to fill it in.

### Setting Up Product Options (Variants)

Options let customers choose things like metal type or ring size.

Example setup:
- Option Name: `Metal Type`
  - Values: `Gold`, `Rose Gold`, `Silver`
- Option Name: `Ring Size`
  - Values: `6`, `7`, `8`, `9`

Click **Add** under Options, type the option name, then add each value under Values.

### Assigning a Nav Item from the Product List

On the Products list page, there's an **Assign Nav Item** button at the top. Use this to bulk-assign selected products to a nav item — it's quicker than editing each product one by one.

---

## Categories

Categories organize products into groups like Rings, Necklaces, Earrings.

### Fields

| Field | What it does |
|---|---|
| Title | Category name (e.g. Rings). Required. |
| Slug | URL-safe identifier — must be lowercase, no spaces (e.g. `rings`). Required. |
| Image | Category image shown in the Featured Categories section on the homepage. |

> To link a product to a category, go to the **product edit page** and pick the category from the Category field — not the other way around.

---

## Collections

Collections are themed groups of products — like "Bridal Collection" or "Summer Edit". A product can belong to both a category and a collection.

### Fields

| Field | What it does |
|---|---|
| Title | Collection name. Required. |
| Slug | URL-safe identifier (e.g. `bridal`). Required. |
| Hero Image | Large banner image shown at the top of the collection page. |
| Description | Short text describing the collection. |
| Products | Select which products belong to this collection. Use the search to find and add multiple products. |

---

## Media

All images and files used across the site are stored here. You can reuse any uploaded file — no need to upload the same image twice.

### Uploading Files

1. Click **Media** in the sidebar
2. Click **Create New**
3. Drag and drop your file or click to browse
4. Fill in the **Alt Text** field — this is the descriptive text for the image (important for SEO and accessibility)
5. Click **Save**

### Tips

- Supported formats: JPG, PNG, WebP, SVG, GIF
- Max file size: **20MB**
- Optimize images before uploading — compress them to web quality to keep the site fast
- To reuse an existing image (e.g. when editing a product), click the upload field and search the media library instead of uploading again

---

## Nav Items

Nav items control what appears in the navigation bar at the top of the site.

### Fields

| Field | What it does |
|---|---|
| Label | Text shown in the nav bar (e.g. Rings, Necklaces). Required. |
| Slug | URL slug — determines the page URL: `/nav/[slug]`. Required. |
| Order | Display order in the nav bar. Lower number = appears first. |
| Products | Products shown on the nav item's page. |

### Example

- Label: `Rings` / Slug: `rings` / Order: `1` → appears at `/nav/rings`
- Label: `Necklaces` / Slug: `necklaces` / Order: `2` → appears at `/nav/necklaces`

> **Warning:** Changing a slug after the nav item is live will break any existing links to that page. Avoid renaming slugs once content is published.

---

## Policies

Policies are standalone text pages — Privacy Policy, Return Policy, Terms & Conditions, etc. They live at `/policies/[slug]`.

### Fields

| Field | What it does |
|---|---|
| Title | Page title shown at the top of the policy page. Required. |
| Slug | URL slug (e.g. `privacy-policy`, `return-policy`). Must match the link used on the site. |
| Body | Full policy text — supports rich text (headings, bold, lists, links). |

### Rich Text Basics

In the Body field you can:
- Use **H1/H2/H3** for section headings
- Use **Bold** and *Italic* for emphasis
- Use bullet or numbered lists
- Add hyperlinks by selecting text and clicking the link button

---

## Homepage Settings

Homepage Settings is a **Global** — there's only one, and it controls the entire homepage layout. Find it under the **Globals** section in the sidebar.

### Sections

#### Hero

The large banner at the very top of the homepage.

| Field | What it does |
|---|---|
| Headline | Main heading text |
| Subline | Smaller text below the headline |
| CTA Label | Button text (e.g. "Shop Now") |
| CTA Link | Where the button goes (e.g. `/nav/rings`) |
| Image | Background or hero image |

#### Featured Categories

Pick which categories appear as tiles on the homepage. The category image you set in the Categories collection is used here.

#### Signature Products

Products shown in the signature/hero products strip on the homepage.

#### Campaign Banner

A full-width promotional banner.

| Field | What it does |
|---|---|
| Image | Banner image |
| Headline | Banner text |
| CTA Label | Button text |
| CTA Link | Button destination URL |

#### Featured Products

Products shown in the "Product Highlights" section further down the homepage.

#### Brand Story

The editorial section that tells the Elowen story.

| Field | What it does |
|---|---|
| Image | Story image |
| Headline | Section heading |
| Body | Story text — supports rich text |

#### Newsletter Headline

The heading shown above the email signup form at the bottom of the homepage.

### Saving

Click **Save** at the top right. Changes go live on the homepage immediately.

---

## Users (Admin Accounts)

This collection manages who can log into the admin panel.

### Creating a New Admin User

1. Click **Users** in the sidebar
2. Click **Create New**
3. Enter the **Email** and **Name**
4. Set a **Password**
5. Click **Save**

The new user can now log in at `/admin`.

### Removing Access

Open the user, scroll to the bottom, and click **Delete**. This permanently removes their access.

### Password Reset

From the login screen at `/admin`, click **Forgot Password** and follow the email reset flow. Or an existing admin can open the user record and set a new password directly.

---

## General Tips

- **Deletions are permanent.** There is no recycle bin or undo. Double-check before deleting anything.
- **Slugs are URLs.** Once a product, category, or policy is live, avoid changing its slug — it will break existing links and bookmarks.
- **Changes are live immediately.** There's no draft/preview mode — saving a record publishes it straight to the storefront.
- **Optimize images before uploading.** Large images slow down the site. Aim for under 2MB per image where possible (hard limit is 20MB).
- **Reuse media.** Use the media library search instead of uploading duplicate images — it keeps storage tidy.
