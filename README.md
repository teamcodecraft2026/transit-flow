# Pink Card

You are building the PASSENGER-side frontend for "Public Transit" (a.k.a. SmartBus / Pink Transit), 

a bus ticketing PWA. I am providing screen-recordings/screenshots of the exact target design. 

⚠️ CORE RULE: The attached visuals are the ABSOLUTE SOURCE OF TRUTH for every color, spacing value, 

font, animation, and layout decision. Do NOT fall back to generic shadcn/Tailwind default styling, 

default card shadows, default rounded-md corners, or default font stacks. If something in these 

instructions and the visuals ever conflict, the visuals win. My backend (Supabase Edge Functions) is 

100% built and live — build ONLY the frontend, written clean and modular so I can wire up 

fetch/axios calls in a later step. Do not invent backend logic; leave clearly marked TODO hooks 

for API calls instead.

The app has THREE visual accent systems layered on the same near-black canvas + shared typography — 

build all as reusable design tokens (CSS variables / Tailwind theme extension), never hardcoded 

per-component:

THEME A — "Rose" (Role-Select screen, Home/Landing, Pink Card page)

THEME B — "Navy/Bright-Blue" (Book/Search page, My Trips page — accent #1660DE)

THEME C — "Periwinkle" (Auth modal ONLY — a softer indigo-blue, #5A7DC5, distinct from Theme B)

═══════════════════════════════════════════════════════

1. AESTHETIC & VISUAL SPEC

═══════════════════════════════════════════════════════

── COLOR PALETTE (exact hex, sampled from source) ──

Global / Shared:

- Base canvas (near-black): #05060B (footer/section bg), #010009 (deepest page bg)

- Card/panel surface (dark glass): #14141C @ 88% opacity, 1px border rgba(255,255,255,0.08)

- Primary body text: #E8E6E2 (warm off-white)

- Secondary/muted text: #9B9894 (warm grey)

- Divider lines: rgba(255,255,255,0.12)

Theme A — Rose:

- Primary accent (headline highlight, "Minutes", "Move—Freely"): #E85D82 → #EE5F84

- CTA button fill (solid pink): #D65779 → gradient to #C13F66

- Pink Card physical card gradient: linear-gradient(135deg, #D0216D 0%, #920946 100%)

- Outline/secondary button border: #EE5F84 @ 60% opacity, transparent fill

- Step numerals (01/02/03/04): #C23760 serif

- Ambient glow (decorative SVG light-trails, corners): #FF2E76 at 8-15% opacity, heavy blur

- Nav active/hover dot indicator: #3ED598 (small ~6px green status dot)

Theme B — Navy/Bright-Blue:

- Primary accent (buttons, active tab underline): #1660DE → #2E7BFF

- Input field fill: #042054 / #0A122A (deep navy)

- Panel/banner fill (feature strip): #111725 @ 95%, border 1px #1E3A6B

- Info-card icon tint: #4C86E8

- Page background photography: desaturated navy night-street photo, ~30% brightness, dark 

  vignette overlay #000000 @ 55%

Theme C — Periwinkle (Auth modal):

- Bus icon fill + primary "Send OTP" button fill: #5A7DC5 (flat solid, no gradient)

- "Sign up" inline link text: same #5A7DC5 tone

- Modal panel bg: dark translucent glass — sampled ~rgba(40,34,36,0.55) over the blurred hero, 

  i.e. use a semi-transparent dark fill (~#241E1F @ 50-60% opacity) + backdrop-filter: blur(20px) 

  so the hero photo behind is visible but heavily softened

- Modal border: 1px rgba(255,255,255,0.10), radius ~20px (larger radius than standard cards)

- Input field inside modal: transparent/very-dark fill, 1px bottom-border or full border 

  rgba(255,255,255,0.15), no fill contrast — reads almost like an underlined field group

- "+91" prefix sits inside the same input row, separated from the number field by a thin 

  vertical divider line, both left-aligned inside one bordered input container

Neutral / Button system:

- Cream/ivory button (Home hero "Book Ticket" CTA): fill #C1B9A4, text #282322, 

  border-radius 10px, 1px border rgba(255,255,255,0.15)

- Outline ghost button ("Renew Card", "Learn More"): transparent fill, 1px border 

  rgba(255,255,255,0.35), text #EDEBE7

── TYPOGRAPHY ──

- Display/Heading font: elegant serif — "Cormorant Garamond" (fallback "Playfair Display"). 

  Weight 500-600, ITALIC specifically for hero sublines.


- Body/UI font: clean geometric sans — "Poppins" (fallback "Inter"). 400 body, 500 nav/labels, 

  600 buttons.

- Modal heading ("Welcome Back"): serif, bold, ~24px, centered

- Modal subcopy ("Enter your phone number to continue"): sans, ~14px, muted, centered

- Hero H1: ~56-64px serif regular; italic subline ~44-48px directly below, no extra margin

- Section H2: ~36px serif centered, flanked by thin horizontal rules

- Eyebrow/badge pills: 11px uppercase-tracked sans inside a bordered pill with a small dot icon

- Nav links: 15px serif, 32-40px gaps

── STRUCTURE / LAYOUT / SPACING ──

- Sticky top navbar: translucent dark bg, backdrop-blur, ~88px height, inset ~16px from screen 

  edges on the home hero, rounded-rect outer container with visible border

- Nav order: Logo | Book · My Trips · Pink Card | EN/বাং toggle | Login | Sign-up

- AUTH MODAL: renders as a centered overlay ON TOP of whichever page triggered it (confirmed: 

  the Home hero remains fully visible but heavily blurred/dimmed behind it — this is a true 

  modal/dialog, NOT a route change). Modal content, top to bottom, centered:

  1. Bus icon (simple line-style bus glyph, periwinkle fill, ~32px)

  2. "Welcome Back" heading

  3. "Enter your phone number to continue" subcopy

  4. One bordered input row: "+91" | vertical divider | "10-digit number" placeholder

  5. Full-width "Send OTP" button (periwinkle fill, white text, ~10px radius)

  6. Centered "New here? Sign up" line — "New here?" muted, "Sign up" as periwinkle link

  Modal width ~420px, generous internal padding (~32px), sits vertically centered in viewport.

- Section spacing: ~120-160px vertical padding between major sections

- Card grid (4-step section): 4 equal-width cards, ~24px gap, ~340px min-height, 32px padding

- Corner radii: cards/panels 16-20px; buttons 8-10px (auth modal itself uses a larger ~20px 

  radius); QR-code frame uses cut-corner "viewfinder" bracket styling (corner-only borders)

- Footer: 3-column link grid + brand blurb, full-width, thin divider, centered copyright bar

── SHADOWS / DEPTH ──

- Cards: soft ambient shadow, 0 20px 60px rgba(0,0,0,0.5)

- Auth modal: heavier drop shadow than standard cards (it floats above a blurred backdrop) — 

  0 30px 80px rgba(0,0,0,0.6), plus the backdrop-blur itself is the main depth cue

- Pink Card 3D render: glowing pink ring light under the pedestal (radial-gradient glow, 

  #FF2E76 low opacity, large blur)

- Buttons: flat fill, no heavy shadow, 1-2px inner border only

═══════════════════════════════════════════════════════

2. ANIMATIONS & TRANSITIONS SPEC

═══════════════════════════════════════════════════════

- Hero headline entrance: typewriter/progressive-reveal, ~600-800ms linear, then italic subline 

  fades up (Y:12px→0, opacity 0→1) 400ms ease-out ~200ms after. Eyebrow badge fades in FIRST 

  (150ms ease-out). Body + CTAs fade+slide-up 400ms ease-out, staggered 100ms after subline, 

  buttons stagger 80ms apart.

- AUTH MODAL open transition: backdrop fades to blurred/dimmed state (opacity + backdrop-filter 

  blur ramping 0→20px) over ~300ms ease-out, WHILE the modal panel itself scales+fades in 

  (scale 0.95→1, opacity 0→1) over ~250ms ease-out, slightly overlapping the backdrop transition. 

  Close = reverse of this, ~200ms.

- Section scroll-reveal (4-Steps cards, feature pills): opacity 0→1 + translateY 24px→0, 500ms 

  cubic-bezier(0.16, 1, 0.3, 1), staggered ~120ms left-to-right, IntersectionObserver threshold 

  0.2, animate once.

- Trip list rows ("My Trips"): slide in from the right with staggered ghost-trail feel 

  (translateX 40px→0, opacity 0→1), 450ms ease-out, staggered 90ms per row.

- Nav hover: label shifts to accent color + small 6px status dot fades in beside it, 150ms ease.

- Button hover: fill brightens ~8-10%, scale(1.02), 150ms ease-out; outline buttons wash their 

  border color into the background on hover.

- Pink Card 3D render idle float: translateY ±6px, 4s ease-in-out infinite; pedestal ring glow 

  pulses opacity 0.6↔1, 3s ease-in-out infinite.

- Language toggle switch (EN/বাং): the active-label highlight knob slides horizontally between 

  the two states, ~200ms ease-out, plus all visible UI text should crossfade (150ms) to the 

  translated string when switched (see Section 3/4 for the i18n requirement itself).

- Page/section transitions: simple crossfade (250ms), no hard cuts.

- Prefer cubic-bezier(0.16, 1, 0.3, 1) for entrances, cubic-bezier(0.4, 0, 0.2, 1) for hover/

  micro-states. Respect prefers-reduced-motion.

═══════════════════════════════════════════════════════

3. INTERACTIVITY & COMPONENT SPEC

═══════════════════════════════════════════════════════

SCREEN 0 — Role Select (entry point):

- Two glassmorphic cards side-by-side on a dark blurred street-photo backdrop: "Passenger" 

  (pink-bordered) and "Conductor" (blue-bordered), each with icon badge, title, one-line 

  description, full-width pill "Continue" CTA in the card's accent color.

- Passenger → continues into the flow below. Conductor → simple "Coming soon" stub screen 

  (Conductor/Admin UI specified separately later).

SCREEN 1 — Home / Landing (Theme A):

- Full-bleed bus-interior night photo hero, sticky nav on top.

- EN/বাং TOGGLE — build this as a REAL, FUNCTIONAL bilingual language switcher, not a cosmetic 

  UI element. See Section 4 for the exact requirement.

- Primary CTA "Book Ticket" → if logged out, opens the Auth Modal (Screen 2) first, then 

  continues to Book/Search on success. If logged in, goes straight to Book/Search.

- Secondary CTA "Renew Card" → Pink Card screen.

- Scroll sections: "Seamless Travel in Four Steps" (4-card grid with illustrative mini-UI 

  mockups), "Pink Card spotlight" split section, footer.

SCREEN 2 — Auth Modal (Login / Sign-up) — MATCHES PROVIDED SCREENSHOT EXACTLY:

- Renders as a centered modal/dialog OVER the current page (confirmed background: the Home 

  hero stays visible but blurred + dimmed behind it — implement with a fixed-position overlay, 

  backdrop-filter: blur(20px), dark scrim rgba(0,0,0,0.4) under the modal panel).

- Triggered by: clicking "Login" in the navbar, OR clicking any action that requires auth 

  (e.g. "Book Ticket" while logged out).

- Content (top to bottom, centered, ~420px wide panel):

  1. Small periwinkle bus-glyph icon

  2. "Welcome Back" — serif bold heading

  3. "Enter your phone number to continue" — muted sans subcopy

  4. Single bordered input row containing "+91" (fixed prefix) + vertical divider + a 

     10-digit number field (placeholder: "10-digit number") — this maps 1:1 to the backend's 

     phone validation (10 digits, starting 6-9)

  5. Full-width "Send OTP" button, periwinkle fill (#5A7DC5), white text

  6. Centered helper line: "New here? " (muted) + "Sign up" (periwinkle link, switches the 

     modal to a sign-up variant of the same layout — same visual language, no new screen needed)

- After "Send OTP" is submitted, the SAME modal transitions (crossfade, ~250ms) into an OTP-entry 

  state: 6 segmented digit boxes, a "Resend OTP" link with cooldown timer, and a "Verify & 

  Continue" button in the same periwinkle style. Show inline red-tinted error banners for 

  invalid phone / wrong OTP / rate-limit — never use browser alert().

- On verify success: store session token, close modal, continue whatever action triggered it.

SCREEN 3 — Book / Search (Theme B): [unchanged from previous spec — search bar, feature strip, 

  Pink Card banner, footer; results list built to match the navy design language even though 

  not shown in source video]

SCREEN 4 — My Trips (Theme B): [unchanged — tab switcher, trip row list, ₹0 Pink Card badge 

  vs plain fare text]

SCREEN 5 — Pink Card (Theme A): [unchanged — hero with floating 3D card render, "Who Can 

  Apply?" 3-step process, footer]

GLOBAL COMPONENTS:

- Reusable <NavBar> with theme-aware accent prop (rose | navy)

- Reusable <Footer>

- Reusable <AuthModal> (two internal states: phone-entry, otp-entry — NOT two separate routes)

- Reusable <Button> variants: solid-cream, solid-pink, solid-blue, solid-periwinkle, outline

- Reusable <SectionEyebrow> pill badge component

- Reusable <StatBadgeStrip> (icon+title+caption)

- Reusable <LanguageToggle> — see Section 4, this must actually switch app language

- QR/Scan bracket-frame component reused for ticket QR + conductor scan-verify state

═══════════════════════════════════════════════════════

4. CORE INSTRUCTIONS FOR LOVABLE

═══════════════════════════════════════════════════════

- You will receive the actual screenshots/recording alongside this prompt — treat every one as 

  ground truth for exact colors, spacing, and motion. Do not substitute default design system 

  choices, default Tailwind slate/zinc grays, default shadcn button/card styles, or generic 

  sans-serif fonts. Match the serif+sans pairing and the three-accent theming exactly.

- The backend is FULLY BUILT (Supabase Edge Functions, live and tested). Build frontend ONLY — 

  clean, modular, componentized React/Tailwind, fully responsive, with clearly commented 

  placeholders (e.g. `// TODO: wire to POST /send-otp`) wherever a real API call will later be 

  plugged in.

- LANGUAGE TOGGLE — IMPLEMENT AS REAL FUNCTIONALITY, NOT DECORATION: build an actual working 

  i18n system (react-i18next, or a lightweight custom context + JSON dictionary is fine) with 

  two locales: `en` and `bn` (Bengali/বাংলা). Every user-facing string across every screen — 

  nav labels, headings, button text, form labels, placeholders, error messages — must pull from 

  this translation layer, not be hardcoded. I will supply the actual Bengali copy separately; 

  for now, populate the `bn` dictionary with reasonable placeholder Bengali translations of the 

  English strings so the toggle is fully demonstrable end-to-end (clicking বাং should visibly 

  re-render the whole current screen's text in Bengali, not just the toggle label itself). 

  Persist the chosen language in localStorage so it survives refresh/navigation.

- Build only the PASSENGER-facing screens listed above (Role-Select, Home, Auth Modal, 

  Book/Search, My Trips, Pink Card). Do NOT build Conductor or Admin dashboards yet — stub them 

  as simple "Coming soon" placeholder routes only.

- Prioritize pixel-accurate spacing, the serif/italic heading treatment, the auth modal's exact 

  backdrop-blur behavior, and the three-accent theming system (rose / bright-blue / periwinkle) 

  above all else — these are the signature visual identity of this product.

first SS is the starting page 
2nd ss is the demo login page

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d217ec3d-94fb-4d7b-a654-a58c3fe687cd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
#   c a c h e   b u s t  
 