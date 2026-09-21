# Studio week log (private)

Owner-only week hub of personal-ops outputs. Not in public nav. Auth is Studio session (GitHub allowlist primary; password emergency; optional `STUDIO_DEV_OPEN` on localhost).

```mermaid
flowchart TB
  You[You] --> Login["/studio/login"]
  Login --> Hub["/studio/week"]
  Hub --> Fitness["/studio/week/fitness"]
  Hub --> Meals["/studio/week/meals"]
  Hub --> Ravens["/studio/week/ravens"]
  Hub --> Newsletter["/studio/week/newsletter"]
  Hub --> Career["/studio/week/careerops"]
  Fitness --> Plan["fitness-coach data/plans"]
  Fitness --> Technique["Heimdall watch/fitness"]
  Meals --> MealSrc["mealplan-private output"]
  Ravens --> RavenSrc["ravens knowledge/signals"]
  Ravens --> ParentWatch["Heimdall watch/parenting"]
  Newsletter --> Digest["Orbit newsletter-draft.json"]
  Career --> CareerSrc["careerops-private digest/scan"]
```

## Routes

| Path | Purpose |
|------|---------|
| `/studio/week` | Hub with status chips |
| `/studio/week/fitness` | Plan + **Technique** expands on matching lifts |
| `/studio/week/meals` | Meal plan |
| `/studio/week/ravens` | Findings + stage-matched parenting **Watch** |
| `/studio/week/newsletter` | Digest draft |
| `/studio/week/careerops` | Scan / apply queues |

Heimdall is not a separate topic. Clips attach inline via `HeimdallEmbed` when `ravens/watch/{domain}/{slug}.md` matches.

## Arc HUD

`ArcStatusCard` paints plan `narrative.stats` in order STR, AGI, SPD, END, VIT, PER. Missing keys are skipped (five-stat plans stay five tiles). SPD is peak velocity from max speed — not AGI (race VDOT) and not END (VO₂max). The number is computed in fitness-coach; Orbit only renders `stats.spd` when the plan JSON includes it (`value_label` like `25.8 km/h`, `raw.max_speed_kmh`, optional `raw.max_speed_delta_30d`). Codex reads `max_speed_kmh` the same way.

## Auth

- Primary: GitHub OAuth (`GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`), allowlist `STUDIO_GITHUB_ALLOWLIST`.
- Session cookie `orbit_studio`: 90-day TTL, sliding refresh via `/api/studio/session`.
- Emergency password: `STUDIO_PASSWORD` (collapsed on login).
- Local review: `STUDIO_DEV_OPEN=1` skips the login gate in development only.
