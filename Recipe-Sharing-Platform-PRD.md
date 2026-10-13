# Product Requirements Document
## Recipe Sharing Platform

**Version:** 1.0
**Date:** September 2026
**Author:** Product Team

---

## 1. Overview

### 1.1 Product Summary
A web application built on Next.js where users can create accounts, upload their own recipes (with photos, ingredients, and step-by-step instructions), and browse/search recipes shared by the community.

### 1.2 Problem Statement
Home cooks want a simple, fast way to save and share recipes without the clutter, ads, and lengthy backstories common on recipe blogs. This platform focuses on clean recipe creation, easy discovery, and community sharing.

### 1.3 Goals
- Let users sign up, log in, and manage a profile
- Let users create, edit, and delete their own recipes with images
- Let users browse, search, and filter recipes by category/ingredient/cuisine
- Provide a fast, mobile-friendly, SEO-friendly experience

### 1.4 Non-Goals (v1)
- Meal planning / grocery list generation
- Recipe rating algorithms or recommendation engine
- Real-time chat or messaging between users
- Native mobile apps (web-responsive only for v1)

---

## 2. Target Users

| Persona | Description | Key Need |
|---|---|---|
| **Recipe Creator** | Home cook who wants to share original recipes | Easy upload flow, photo support |
| **Recipe Browser** | User looking for meal ideas | Fast search/filter, clean recipe view |
| **Casual Visitor** | Not signed in, browsing publicly | Can view recipes without an account |

---

## 3. Core Features

### 3.1 Authentication & User Accounts
- Sign up / log in via email + password
- OAuth login (Google, optionally GitHub) — Supabase Auth supports this natively
- Password reset flow
- User profile page: avatar, display name, bio, list of their recipes

### 3.2 Recipe Creation & Management
- Create recipe form:
  - Title, description
  - Cover image upload
  - Ingredients list (dynamic add/remove rows)
  - Step-by-step instructions (dynamic add/remove steps)
  - Prep time, cook time, servings
  - Category/cuisine tags
  - Difficulty level
- Edit/delete own recipes
- Draft vs. Published status (optional for v1, nice-to-have)

### 3.3 Recipe Browsing & Discovery
- Home feed: recently added / trending recipes
- Search bar (by title, ingredient)
- Filter by category, cuisine, difficulty, prep time
- Individual recipe detail page (image, ingredients, instructions, author)
- Pagination or infinite scroll on listing pages

### 3.4 Social/Engagement (v1 lightweight)
- Like/favorite a recipe
- Save recipe to "My Favorites"
- View count on recipes (optional)

### 3.5 Image Handling
- Upload recipe photos to Supabase Storage
- Auto-resize/optimize via Next.js Image component
- Fallback placeholder image if none uploaded

### 3.6 Admin/Moderation (basic)
- Report a recipe (flag for review)
- Simple admin flag on user table for moderators (manual moderation in v1, no dashboard needed initially)

---

## 4. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | **Next.js 15** (App Router) | Server components, SSR/SSG for SEO |
| Language | **TypeScript** | Type safety across app |
| Styling | **Tailwind CSS** + shadcn/ui | Fast, consistent UI components |
| Backend/DB | **Supabase (Postgres)** | Managed relational DB |
| Auth | **Supabase Auth** | Email/password + OAuth providers |
| File Storage | **Supabase Storage** | Recipe images, avatars |
| API Layer | Next.js Route Handlers + Supabase JS client | No separate backend server needed |
| State/Data Fetching | **TanStack Query (React Query)** | Client-side caching for interactive pages |
| Form Handling | **React Hook Form** + Zod | Validation for recipe creation form |
| Hosting | **Vercel** | Native Next.js deployment |
| Image Optimization | Next.js `<Image>` component | Automatic resizing/lazy load |

### Why Supabase fits this project
- Postgres gives you relational integrity between users, recipes, ingredients, and likes
- Row Level Security (RLS) policies let you enforce "users can only edit their own recipes" directly at the database level, reducing backend code
- Built-in Auth removes need for a custom auth system
- Storage buckets handle recipe images with signed URLs / public access controls

---

## 5. Data Model (Supabase / Postgres)

```
users (managed by Supabase Auth, extended with a profiles table)
├── profiles
│   ├── id (uuid, FK -> auth.users.id)
│   ├── username
│   ├── display_name
│   ├── avatar_url
│   ├── bio
│   └── created_at

recipes
├── id (uuid, PK)
├── author_id (FK -> profiles.id)
├── title
├── description
├── cover_image_url
├── prep_time_minutes
├── cook_time_minutes
├── servings
├── difficulty (enum: easy/medium/hard)
├── status (enum: draft/published)
├── created_at
├── updated_at

recipe_ingredients
├── id (uuid, PK)
├── recipe_id (FK -> recipes.id)
├── ingredient_text
├── sort_order

recipe_steps
├── id (uuid, PK)
├── recipe_id (FK -> recipes.id)
├── step_number
├── instruction_text

categories
├── id
├── name (e.g. "Breakfast", "Vegan", "Italian")

recipe_categories (many-to-many)
├── recipe_id (FK)
├── category_id (FK)

favorites
├── user_id (FK -> profiles.id)
├── recipe_id (FK -> recipes.id)
├── created_at
```

### Row Level Security (key policies)
- `recipes`: SELECT allowed for all (if `status = published`); INSERT/UPDATE/DELETE only where `author_id = auth.uid()`
- `favorites`: SELECT/INSERT/DELETE only where `user_id = auth.uid()`
- `profiles`: SELECT allowed for all; UPDATE only own row

---

## 6. Key User Flows

1. **Sign up → Create first recipe → Publish → View on public feed**
2. **Browse feed → Search "chicken" → Filter by "Dinner" → Open recipe → Favorite it**
3. **Log in → Go to profile → Edit an existing recipe → Save changes**

---

## 7. Non-Functional Requirements
- Page load (recipe detail) under 2s on 4G
- Mobile-responsive across all core pages
- Images optimized/lazy-loaded
- Basic SEO: meta tags, OpenGraph tags per recipe page, sitemap.xml
- Accessibility: semantic HTML, alt text on images, keyboard-navigable forms

---

## 8. Step-by-Step Implementation Guide

### Phase 0 — Setup (Day 1)
1. Create Next.js app: `npx create-next-app@latest recipe-app --typescript --tailwind --app`
2. Create a Supabase project at supabase.com
3. Install dependencies:
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   npm install @tanstack/react-query react-hook-form zod @hookform/resolvers
   npx shadcn@latest init
   ```
4. Add Supabase URL + anon key to `.env.local`
5. Set up a `lib/supabase/client.ts` and `lib/supabase/server.ts` (browser vs server clients, per Supabase SSR guide)

### Phase 1 — Database Schema (Days 2-3)
1. In Supabase SQL editor, create tables: `profiles`, `recipes`, `recipe_ingredients`, `recipe_steps`, `categories`, `recipe_categories`, `favorites`
2. Enable Row Level Security on every table
3. Write RLS policies (see Section 5)
4. Create a Postgres trigger to auto-insert a `profiles` row when a new `auth.users` row is created
5. Create a Storage bucket `recipe-images` (public read, authenticated write)

### Phase 2 — Authentication (Days 4-5)
1. Build `/login` and `/signup` pages using Supabase Auth UI or custom forms
2. Implement middleware (`middleware.ts`) to refresh sessions and protect routes like `/dashboard`, `/recipes/new`
3. Add OAuth buttons (Google) via Supabase Auth providers
4. Build profile page reading/writing to `profiles` table

### Phase 3 — Recipe CRUD (Days 6-9)
1. Build `/recipes/new` form (React Hook Form + Zod validation)
2. Handle image upload to Supabase Storage, store returned URL on `recipes.cover_image_url`
3. Implement dynamic ingredient/step field arrays
4. Build API route handlers (or direct Supabase client calls from server actions) for create/update/delete
5. Build `/recipes/[id]/edit` page reusing the form component
6. Add delete-with-confirmation flow

### Phase 4 — Browsing & Search (Days 10-13)
1. Build home feed `/` — server-rendered list of published recipes (paginated)
2. Build `/recipes/[id]` detail page (server component, SSR for SEO)
3. Add search input (query `recipes` table with `ilike` on title/description, or Postgres full-text search)
4. Add category filter using `recipe_categories` join
5. Add loading/skeleton states with React Query on client-interactive parts

### Phase 5 — Social Features (Days 14-15)
1. Implement favorite/unfavorite toggle (optimistic UI with React Query)
2. Build "My Favorites" page under user profile
3. (Optional) View counter using a Postgres function incrementing on page load

### Phase 6 — Polish & Launch Prep (Days 16-18)
1. Add OpenGraph meta tags per recipe (dynamic `generateMetadata` in Next.js)
2. Add `sitemap.xml` and `robots.txt`
3. Responsive/mobile QA pass
4. Add error boundaries and 404/empty states
5. Set up analytics (e.g. Vercel Analytics)

### Phase 7 — Deploy (Day 19)
1. Push repo to GitHub
2. Connect repo to Vercel, add environment variables
3. Set Supabase RLS to production mode (double-check policies)
4. Deploy and smoke-test all core flows in production

---

## 9. Success Metrics (v1)
- Number of recipes published in first 30 days
- Weekly active users
- Average time-to-publish for a new recipe (measures form usability)
- Search-to-view click-through rate

---

## 10. Future Considerations (Post-v1)
- Comments on recipes
- Recipe ratings/reviews
- Meal planning & shopping list export
- User following/feed of followed creators
- Recipe scaling (adjust ingredient quantities by serving size)
