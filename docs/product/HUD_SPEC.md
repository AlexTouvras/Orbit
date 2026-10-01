# HUd — Professional Identity Card

## Route

`/card`

## Question answered

**WHO IS ALEX?**

## Purpose

Someone who has never met Alex should understand who he is and what he can do in roughly **15–30 seconds**, then follow curiosity into the Hub for evidence.

## Existing implementation = baseline

The current `/card` is the product to evolve.

**Do not** replace the concept, interaction model, or visual identity from scratch.

Preserve:

- Name + role + location
- Short tagline
- Experience / education / domains stats
- Capability lanes with progressive disclosure
- Links into Portfolio / Blog / About / Contact
- QR / share path via `/qr-code`

## Desired evolution (Foundation)

1. Role → archetype short string: **AI & Data Systems Lead**
2. Tagline → locked STATEMENT (or owner-approved equivalent)
3. Keep lanes; they show domain breadth along the chain, not five unrelated specialties
4. Studio still stores `focusNow` for trajectory — **not shown on `/card`** (owner 2026-09-23: duplicated the STATEMENT; card stays identity-only)

## NOW rules

- `focusNow` lives in Studio roadmap only (private trajectory)
- **Do not** put NOW / milestone titles on the card
- **Do not** turn HUd into a progress dashboard for visitors

## Private face (owner, 2026-09-24)

The same `/card` can flip to the fitness Arc HUD. The control is **Flip for stats**, and the portrait on that card does the same flip. It renders only when the Studio session is present. The stats are loaded from `/api/card/arc` and are not in the public HTML. Visitors still get the identity card alone.

The public portrait on Hub, About, and the other page heroes links to `/card?face=arc`. A Studio session lands on the Arc face. Everyone else still sees the identity card. Under **Arc Mode**, the title is the name. The line under the name is **Warrior**. The site title stays **AI & Data Systems Lead**.

## Hierarchy for the visitor

1. Alex Touvras
2. Professional identity (archetype / role)
3. Current focus (NOW)
4. Core capabilities (lanes)
5. Evidence / deeper exploration (links out)
6. Contact

## Sharing

Optimize for mobile, QR, direct URL, fast load, clear first viewport, screenshotability.

## Success test

If someone met Alex and opened alex­touvras.com/card, could they understand what he does in 15–30 seconds?

If not, simplify — do not add more content.

## Out of scope for HUd

- Roadmap lists
- Career timeline
- Studio controls
- Cinematic chapter restyle
- New interactive visualizations
