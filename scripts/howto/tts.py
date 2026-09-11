#!/usr/bin/env python3
"""Generate TTS voiceover for the Helsinki Housing how-to pilot."""

from __future__ import annotations

import asyncio
from pathlib import Path

import edge_tts

# Calm, clear English — good for how-to pacing.
VOICE = "en-GB-SoniaNeural"
OUT = Path("/tmp/howto-housing-vo.mp3")

TEXT = """
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
""".strip()


async def main() -> None:
    communicate = edge_tts.Communicate(TEXT, VOICE, rate="-5%")
    await communicate.save(str(OUT))
    print(f"wrote {OUT}")


if __name__ == "__main__":
    asyncio.run(main())
