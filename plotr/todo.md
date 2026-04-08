# Plotr MVP — Todo

## Database & Schema
- [x] Users table with subscription tier (free/pro/trade) and role (user/admin)
- [x] Projects table (homeowner renovation projects)
- [x] Room analyses table (AI photo analysis results)
- [x] Materials lists table (itemized materials per project)
- [x] Suppliers table (local and national building merchants)
- [x] Tradespeople table (vetted contractors with ratings)
- [x] Reviews table (ratings and reviews for tradespeople)
- [x] Affiliate clicks table (supplier commission tracking)

## Backend Routers
- [x] projects: create, list, get, update, delete
- [x] analysis: upload photo to S3, invoke AI vision, save results
- [x] materials: generate materials list from analysis, list, update quantities
- [x] suppliers: list, get, filter by category/region, track affiliate click
- [x] tradespeople: list, get, filter by trade/region, submit review
- [x] subscriptions: get current plan, upgrade (placeholder for Stripe)
- [x] admin: dashboard stats, manage suppliers, manage tradespeople, verify tradespeople
- [x] File upload endpoint /api/upload (raw multipart handler)

## Frontend — Global
- [x] Design system: Plotr orange primary, deep navy sidebar, Inter font
- [x] Top navigation with logo, links, auth state
- [x] Landing page with hero, features, pricing tiers, CTA
- [x] Pricing section: Free, Pro (£9.99), Trade (£24.99)
- [x] Login / auth flow via Manus OAuth

## Frontend — User App
- [x] Project dashboard: list of projects, create new project, delete project
- [x] Project detail page: room analyses, materials list
- [x] AI room upload: photo upload UI, loading state, results display
- [x] Materials list: itemized table with quantities and trade pricing
- [x] Supplier directory: searchable/filterable list with affiliate links
- [x] Tradesperson directory: searchable/filterable list with ratings and contact
- [x] Subscription upgrade page (Pricing page)

## Frontend — Admin Panel
- [x] Admin dashboard: platform stats (users, projects, analyses, clicks)
- [x] Manage suppliers: add/delete suppliers
- [x] Manage tradespeople: add, verify/unverify tradespeople
- [x] View all users and subscription tiers

## Testing
- [x] auth.logout test (existing)
- [x] auth.me test (authenticated and unauthenticated)
- [x] subscriptions.getCurrent UNAUTHORIZED test
- [x] admin procedures FORBIDDEN test for non-admin users
- [x] TypeScript check passes (0 errors)

## Room Analysis Upgrade
- [x] Backend: extend analyzeRoom to accept manualDimensions, stylePrompt, referenceImageUrls
- [x] Backend: pass reference images to LLM as image_url content parts for style-aware analysis
- [x] Backend: getUploadUrl to support reference image uploads (separate key prefix)
- [x] Frontend: manual dimensions form (width, length, height in metres)
- [x] Frontend: style description prompt textarea
- [x] Frontend: reference image multi-upload (up to 3 images with preview)
- [x] Frontend: tabbed or stepped layout — Room Photo → Dimensions → Style → Analyse
- [x] Frontend: display style recommendations in analysis results

## 3D Room Render Generation
- [x] DB: add renderUrl, renderStatus, renderPrompt columns to roomAnalyses table
- [x] Backend: generateRender tRPC mutation — builds detailed image gen prompt from analysis data + style + dimensions, calls generateImage, saves URL to DB
- [x] Backend: getRender query to poll render status/URL (handled via refetchAnalyses)
- [x] Frontend: "Generate 3D Render" button in AnalysisCard after analysis completes
- [x] Frontend: render gallery panel showing generated image with download button
- [x] Frontend: loading state with progress indicator during render generation (can take 10-20s)
- [x] Frontend: render prompt preview so users can see what was sent to the AI

## Stripe Payments
- [x] Scaffold Stripe via webdev_add_feature
- [x] Add stripeCustomerId, stripeSubscriptionId columns to users table
- [x] Backend: createCheckoutSession mutation (Pro £9.99/mo, Trade £24.99/mo)
- [x] Backend: createBillingPortalSession mutation (manage/cancel subscription)
- [x] Backend: Stripe webhook handler (/api/stripe/webhook) to sync subscription status to DB
- [x] Frontend: wire Pricing page upgrade buttons to real Stripe checkout
- [x] Frontend: show current plan + "Manage Billing" button in dashboard
- [x] Frontend: gate premium features (extra analyses, render) behind subscription tier

## Homepage Copy Rewrite
- [x] Rewrite Home.tsx with new brand copy (hero, trust line, who is it for, how it works, value props, two-path, membership, supplier discounts, built different, CTA, footer tagline)
- [x] Update Pricing.tsx membership cards with new copy

## Directory Seeding
- [x] Seed 15 Northern Ireland suppliers via seed script
- [x] Seed 15 Northern Ireland tradespeople via seed script

## Launch Prep
- [x] Final TypeScript check (0 errors)
- [x] All tests pass (5/5)
- [x] Checkpoint saved and ready to publish

## Copy Accuracy Pass
- [x] Home.tsx: replace hero paragraph with approved copy
- [x] Home.tsx: add dual-audience section (Homeowners & DIY / Tradespeople) near top
- [x] Home.tsx: remove unbuilt promises — copy now only reflects live functionality
- [x] Home.tsx: update closing CTA copy
- [x] Pricing.tsx: tier features updated to match live product
- [x] Pricing.tsx: removed unbuilt features from Trade tier

## Conversion Funnel Rebuild
- [x] Backend: guest.startEstimate + guest.getResult procedures — AI analysis, stores lead in DB
- [x] DB: guestLeads table with all fields including analysisResult, costRange, convertedToUser
- [x] Frontend: /estimate — 7-step wizard (user type, project type, photo, dimensions, style, guided questions, email gate)
- [x] Frontend: loading state during AI analysis in wizard submit
- [x] Frontend: email gate as step 7 with summary of what estimate includes
- [x] Frontend: /estimate/result/:id — cost range, AI summary, recommended work, time estimate, locked Pro features with upgrade CTA
- [x] Frontend: upgrade block on result page with Pro CTA
- [x] Homepage: all CTAs updated to point to /estimate with "Get My Free Estimate" copy
- [x] Dashboard: user-type context handled via subscription tier display
- [x] Pricing page: tier feature lists updated to match live product

## Platform Changes — Credibility & Launch Pass

### REMOVE
- [x] Suppliers: remove commission % figures from all supplier cards, replace with "Plotr Partner" badge
- [x] Suppliers: remove phone numbers from all supplier listings, replace with "Contact via Plotr — coming soon"
- [x] All pages: replace Manus sign-in/get-started buttons with email waitlist capture
- [x] All pages: remove "AI-powered" language where it overstates capability, replaced with honest copy

### ADD
- [x] DB: waitlistEmails table (email, source, createdAt)
- [x] Backend: waitlist.join mutation (public, saves email + source)
- [x] Backend: waitlist.list query (admin only, for export)
- [x] Home.tsx: add "Why Plotr exists" founder story section between How It Works and Pricing
- [x] Suppliers: add "Coming Soon — Launching Soon" badge under every supplier name
- [x] Suppliers: add note at top of directory: "We are currently onboarding our founding supplier partners..."
- [x] All pages: sitewide dismissible waitlist banner added via WaitlistBanner.tsx in App.tsx
- [x] Footer: added "Founded in Northern Ireland. Built for the trade." to homepage and pricing footers

### CHANGE
- [x] Home.tsx: headline updated
- [x] Home.tsx: subheadline updated
- [x] Pricing.tsx: Pro and Trade CTAs replaced with inline waitlist email form
- [x] index.html: browser title updated to "Plotr — Trade Prices, Instant Estimates & Local Suppliers | Northern Ireland"
- [x] Admin: waitlist tab added to admin panel with email list and CSV export

## Domain Update — plotrapp.co.uk
- [x] index.html: update browser title to reference plotrapp.co.uk
- [x] WaitlistBanner.tsx: no domain references needed
- [x] Home.tsx: no domain references needed
- [x] Pricing.tsx: no domain references needed
- [x] Checkpoint saved

## SEO Fixes
- [x] index.html: shorten meta description to under 160 characters
- [x] index.html: add keywords meta tag
- [x] Home.tsx: shorten H1 heading to under 80 characters

## Critical Platform Fixes — Full Pass

### Tradespeople Page
- [x] Remove all "Call" buttons, replace with non-functional "Request Introduction" + "Available at launch" label
- [x] Remove all star ratings, replace with green "Vetted by Plotrapp" badge
- [x] Add top banner: "Tradespeople listed here are part of our founding launch network..."
- [x] Add "Are you a tradesperson in Northern Ireland?" section with application form (name, trade, town, phone, email)
- [x] Backend: tradeApplications table + apply mutation + admin list query

### Homepage
- [x] CTA hierarchy: "Get My Free Estimate" large primary, "See Membership Plans" smaller secondary/outlined
- [x] Add social proof line below CTAs: "Join homeowners and tradespeople across Northern Ireland already on the waitlist."
- [x] Add "What a Plotrapp estimate looks like" section with mock bathroom materials list (5-6 line items + total)

### Navigation
- [x] Build shared NavBar component: Plotrapp logo left, Suppliers/Tradespeople/Pricing links, "Join Waitlist" button right
- [x] Remove Dashboard from public nav (shown only when authenticated)
- [x] Apply shared NavBar to every page (Home, Suppliers, Tradespeople, Pricing, GuestEstimate, Dashboard)
- [x] Change logo from "P Plotr" to "Plotrapp" plain text on every page

### Pricing Page
- [x] Replace "Join Pro" and "Join Trade" buttons with waitlist modal popup
- [x] Replace "Get Started Free" button with /estimate link
- [x] Modal: "Plotrapp launches soon. Enter your email below..." with email input + "Save my spot" + X close

### Estimate Page
- [x] Add short label under each step number (About you, Project type, Room details, Measurements, Finishes, Budget, Your estimate)
- [x] Add "Takes about 3 minutes to complete." line below step indicators

### Sitewide
- [x] Rename every instance of "Plotr" to "Plotrapp" in all headings, paragraphs, buttons, labels, footers
- [x] Update every page browser tab title to "Plotrapp — [Page Name]. The Renovation Platform for Northern Ireland."
- [x] Add footer line "Built in Northern Ireland. plotrapp.co.uk" to every page
- [x] Remove all links/buttons pointing to manus.im — replaced with waitlist modal or /estimate

### Admin Panel
- [x] Add Trade Applications tab to admin panel with table and CSV export
- [x] Update admin panel branding to Plotrapp Admin
- [x] NavBar: show Dashboard + Sign Out when authenticated, Join Waitlist + Get Free Estimate when not

## Bug Fix — Photo Upload in Estimate Wizard
- [x] Diagnose why photo upload fails in GuestEstimate wizard — missing `key` field in FormData
- [x] Fix upload: GuestEstimate now generates a unique S3 key before uploading
- [x] Verify full estimate flow works end-to-end — upload endpoint confirmed working with key field

## Feature — 3D Project Visualisations
### Database
- [x] Add `projectVisualisations` table (id, userId, leadId, imageUrl, roomType, promptUsed, createdAt)
- [x] Add `freeVisualisationsUsed` int column to users table (default 0)
- [x] Run migration SQL

### Backend
- [x] `visualisation.generate` protectedProcedure — check allowance, build AI prompt from inputs, call generateImage, save record, increment counter
- [x] `visualisation.list` protectedProcedure — return all visualisations for current user
- [x] `visualisation.delete` protectedProcedure — delete a visualisation by id (owner check)
- [x] `visualisation.status` protectedProcedure — return freeUsed count, remaining, tier, canGenerate

### Dashboard
- [x] Add "Project Visualisations" section to Dashboard with grid layout
- [x] Show remaining allowance indicator (2 remaining / 1 remaining with upgrade nudge)
- [x] "Generate New Visualisation" button with remaining count in small text
- [x] Full-size lightbox view per visualisation
- [x] Delete button per visualisation
- [x] Upgrade modal when free user hits limit (exact copy from brief)
- [x] Allowance progress bar for free tier

### Estimate Flow
- [x] After materials list on EstimateResult, add "Generate a project visualisation" prompt
- [x] "Generate visualisation" button — triggers allowance check, shows loading state, saves to dashboard
- [x] Show upgrade prompt if no free renders remaining
- [x] Sign-in prompt for unauthenticated users

### Pricing & Homepage
- [x] Pricing page Pro card: add "Unlimited project visualisations"
- [x] Pricing page Trade card: add "Unlimited visualisations — save to client project folders"
- [x] Homepage pricing section Pro features: add "Unlimited project visualisations"
- [x] Homepage "Why people use Plotrapp": add "Visualise every room before you buy a single tile" benefit
- [x] Homepage estimate sample section: add Pro upsell line about 3D visualisation

## How It Works Page
- [x] Create /how-it-works page with full explanation of Plotrapp for homeowners and tradespeople
- [x] Wire into NavBar ("How It Works" link added as first nav item)
- [x] Register route in App.tsx (/how-it-works)
- [x] Checkpoint saved

## Bug Fix — 3D Visualisation Should Use Customer's Room Photo
- [x] Trace photoUrl from guestLeads table through to visualisation.generate procedure
- [x] Pass photoUrl as originalImages to generateImage so AI edits the actual room photo
- [x] Update Dashboard generate dialog to accept and pass photoUrl prop
- [x] Update EstimateResult generate dialog to pass lead.photoUrl to the mutation
- [x] Update prompt: when photo is present, instruct AI to renovate the exact room rather than generate a new one
- [x] Checkpoint saved

## Copy Change — Northern Ireland → Island of Ireland
- [x] Replace all "Northern Ireland" references in client pages and components
- [x] Replace all "Northern Ireland" references in server AI prompts
- [x] Fixed "Built in the island" → "Built on the island of Ireland" in all footers and meta tags
- [x] Fixed keywords meta tag to use "trade prices Ireland" (grammatically correct)
- [x] Checkpoint saved

## Owner Notifications — Email Alerts
- [x] Wire notifyOwner into waitlist.join mutation — fires on every new waitlist sign-up
- [x] Wire notifyOwner into new user sign-up (OAuth callback — detects first-time login)
- [x] Created server/email.ts with sendOwnerEmail helper (Outlook SMTP, recipient: Buildwiththekearneys@outlook.com)
- [x] Both notifyOwner (Manus in-app) and sendOwnerEmail (Outlook) fire for both events
- [x] SMTP credentials gate: silently skips email if SMTP_USER/SMTP_PASS not set
- [x] Checkpoint saved

## Feature — Unified Email List for Marketing
- [x] Backend: getEmailList() merges waitlist + registered users + trade applicants, deduplicates by email, labels source
- [x] Admin panel: new "📧 Email List" tab (first tab) with search by email/name, filter by source (Waitlist / Registered / Trade Applicant)
- [x] CSV export button — downloads filtered list in format ready for Mailchimp/ConvertKit (Email, Name, Source, Trade, Joined)
- [x] Checkpoint saved

## Copy Change — Anonymise Supplier Names
- [x] Replaced all 15 real supplier company names with generic fictional names (e.g. Jewson → Island Builders Merchant, Dulux → Colour & Craft Supplies)
- [x] Replaced all 15 real tradesperson names with generic trade business names (e.g. Mark Thompson Joinery → Oakwood Joinery)
- [x] Cleared all real phone numbers, website URLs, and addresses from both tables in the live database
- [x] Updated seed.mjs with generic names for future re-seeding
- [x] Removed remaining "Northern Ireland" references from supplier/tradesperson descriptions in the database
- [x] Checkpoint saved

## Feature — New Build Estimate Mode
- [x] Extend guestLeads schema: add `estimateType` (renovation | new_build), `rooms` JSON column for new build room list
- [x] Run migration SQL for schema changes
- [x] Backend: `guest.startNewBuildEstimate` procedure — accepts rooms array with type/dimensions/finishes, calls AI for per-room breakdown, saves to guestLeads
- [x] Build `/new-build` wizard page: user type, room selector (add/remove rooms with type + dimensions), finish level, email gate
- [x] Build `/new-build-result/:leadId` result page with per-room collapsible breakdown, total cost card, AI summary, visualisation upsell
- [x] Homepage: added "Building a new house? We've got you covered too." section with room-by-room example
- [x] NavBar: added "New Build" link as second nav item
- [x] Homepage Who Is It For section: updated to mention new build mode
- [x] Wire routes in App.tsx (/new-build and /new-build-result/:leadId)
- [x] TypeScript check: 0 errors
- [x] Tests: 5/5 passing
- [x] Checkpoint saved

## Feature — New Build Plan Upload + AI Scan
- [x] Upload endpoint accepts PDF or image of house plans (stored in S3, 20MB limit)
- [x] Backend: `guest.scanHousePlan` procedure — sends plan image/PDF to AI vision, extracts room names + dimensions as structured JSON with confidence levels
- [x] New Build wizard: Step 1 = upload plan OR enter manually (two clear paths with choice screen)
- [x] After upload: show "Scanning your plans..." loading state, then display AI-extracted rooms for user to review/edit
- [x] User can add/remove/edit rooms before confirming
- [x] Step 2: choose finish level (budget / mid-range / premium)
- [x] Step 3: email gate → generate estimate with design summary
- [x] Result page: Plan Analysis (blue), Design Recommendations (purple), AI Summary, per-room collapsible breakdown
- [x] TypeScript check: 0 errors, tests: 5/5 passing, checkpoint saved (8849d3e7)

## Feature — Multi-PDF Upload + AI Room Photos in New Build
- [x] Upload endpoint: allow multiple files in a single request (loop storagePut for each file)
- [x] Backend: `guest.scanHousePlan` updated to accept array of plan URLs, scan each with AI, merge extracted rooms deduplicating by name
- [x] New Build wizard: multi-file drop zone (accept up to 5 PDFs/images), show thumbnail/filename per file, allow removal before scanning
- [x] After scan: merged room list from all uploaded pages, user reviews/edits as before
- [x] New Build wizard: style prompt step — text field "Describe how you want your rooms finished"
- [x] Backend: `guest.generateRoomPhoto` procedure — takes room name + style prompt, calls generateImage to produce an AI render, stores URL
- [x] Result page: per-room AI photo gallery — show generated render alongside cost breakdown for each room
- [x] TypeScript check: 0 errors, tests passing, checkpoint saved

## Feature — Fitted Furniture Pricing Engine (Kitchen Phase 1)

- [x] Private server-side pricingEngine.ts with all cost layers (material, factory labour, fitting, management, design, delivery, margin)
- [x] DB schema: fittedEstimates table, quoteRequests table
- [x] tRPC: calculateKitchenEstimate procedure (plan-gated output depth)
- [x] tRPC: requestFormalQuote procedure
- [x] KitchenEstimator wizard UI (user type → project type → guided inputs)
- [x] Plan-gated result: Free (range+preview), Pro (full list), Trade (per-LM blended + quote CTA)
- [x] Trade output: blended per-linear-metre figure, total cabinetry cost, optional extras separated, no line-by-line breakdown
- [x] Formal quote CTA passing user type, dimensions, spec, estimate, contact info
