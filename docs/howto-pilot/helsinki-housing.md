# How-to video pilot — Helsinki Housing Pulse

> One question. Public UI. Voice + screen. Not a YouTube upload yet.

## Thesis

**Are Helsinki €/m² still rising?** — and how an analytics desk answers that without a Power BI embed.

Spine (field-card): ASK → GRAIN → TRUTH → USE.

## Target length

60–90 seconds.

## Narration (VO)

```
Are Helsinki euro per square metre still rising?

This Orbit live desk is not a Power BI report.
It is one question, fed by Statistics Finland open data, refreshed as a monthly snapshot.

ASK: we care about old flats in housing companies — the liquid Helsinki market.

GRAIN: average euro per square metre, month over month, and year over year.
Not a spreadsheet dump. Five numbers that decide the headline.

TRUTH: July twenty twenty-six is provisional.
Helsinki prints about four thousand nine hundred twenty-six euro per square metre —
down one point one percent month over month, and down two point eight percent year over year.

USE: compare Helsinki to Espoo, Vantaa, Greater Helsinki, and the whole country.
Then check Helsinki sub-areas one through four on the quarterly tape.

Attribution stays on the desk: Statistics Finland, Creative Commons BY four point oh.
If the snapshot is empty, the desk refuses to ship.

That is the habit: grain first, then the board — not chrome first.
```

## Shot list

| # | Beat | URL / action | VO cue |
|---|------|--------------|--------|
| 1 | Open portfolio live strip | `https://alextouvras.com/portfolio#live` | “Are Helsinki…” |
| 2 | Click Helsinki Housing tile | carousel → Housing card | “not a Power BI report” |
| 3 | Hold KPI strip | `/portfolio/live/housing` top KPIs | ASK / GRAIN |
| 4 | Point at MoM / YoY | same, KPI row | TRUTH numbers |
| 5 | Scroll region bars | Capital region vs country | USE compare |
| 6 | Scroll sub-areas + tape | HKI 1–4 + monthly tape | sub-areas |
| 7 | Footer attribution | Stat.fi / CC BY | attribution + takeaway |

## Build (this environment)

```bash
# 1) Voice
python3 scripts/howto/tts.py

# 2) Screen capture → manual RecordScreen + browser walkthrough
#    save as /tmp/howto-housing-silent.mp4

# 3) Mux
bash scripts/howto/mux.sh \
  /tmp/howto-housing-silent.mp4 \
  /tmp/howto-housing-vo.mp3 \
  /opt/cursor/artifacts/howto-helsinki-housing-pulse.mp4
```

## Out of scope for this pilot

- YouTube upload
- Owner mic VO (TTS stand-in)
- Azure / Fabric tenant clicks
- Orbit site embed

## Pilot lessons (2026-09-11)

- Agent “linger” instructions do **not** keep `RecordScreen` rolling for wall-clock time — capture stayed ~16s. Prefer timed stills slideshow (`scripts/howto/slideshow.sh`) or explicit sleep between short capture segments.
- Mux must pad video to full audio duration (`scripts/howto/mux.sh`); `-shortest` alone will clip VO.
- Opening sync: land on the subject desk in the first 1–2s of VO, not after a long carousel hold.
- Next take: cursor/hover on the KPI the VO is reading.