import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Code,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Link,
  Stack,
  Stat,
  Table,
  Text,
} from "cursor/canvas";

export default function FitnessCourseSlicers() {
  return (
    <Stack gap={24}>
      <Stack gap={8}>
        <H1>Weekly course slicers</H1>
        <Text>
          Five controls should feed Sunday <Code>coach-week</Code>. Race{" "}
          <Text as="span" weight="semibold">
            date
          </Text>{" "}
          already lives on the mesocycle and drives phase; stance is a separate
          choice about that date. Lift density has three natural rungs, not a
          lift-count slider.
        </Text>
      </Stack>

      <Grid columns={3} gap={12}>
        <Stat value="5" label="Weekly training slicers" />
        <Stat value="1" label="Skin control, not load" />
        <Stat value="0" label="Cut / lean-mode flags" />
      </Grid>

      <Callout tone="info" title="Live course already fits the science">
        <Text>
          Current <Code>data/course.json</Code> is Short windows + Race as test
          + Strength (not hypertrophy) + Focus lifts + GTG. That is the right
          concurrent pattern for a 5K sharpen with a newborn constraint. The
          slicer job is to make those five choices visible, not to add a sixth
          philosophy.
        </Text>
      </Callout>

      <H2>Keep — weekly planner input</H2>
      <Text tone="secondary" size="small">
        Source: fitness-coach course flags + how <Code>planner.py</Code> and{" "}
        <Code>strength_program.py</Code> apply them on Sunday.
      </Text>
      <Table
        headers={["Slicer", "Options", "Writes", "Why it belongs"]}
        columnAlign={["left", "left", "left", "left"]}
        rows={[
          [
            "Life window",
            "Full week / Short windows",
            "time_efficient",
            "Caps recoverable volume (runs, lifts, skip optional bike). Newborn sleep policy rides this flag — mild sleep is context, not a quality cut.",
          ],
          [
            "Race stance",
            "Peak / Test / Skip — only if an event date exists",
            "race_effort",
            "This is what the race is for, not how far away it is. Phase (build / sharpen / taper) is already computed from profile race_date: >21d build, 8–21d sharpen, ≤7d taper.",
          ],
          [
            "Lift intent",
            "Maintain / Strength / Hypertrophy",
            "course + profile lifting intent",
            "Templates already exist. Today Slack “lean into strength” always writes Strength and never Hypertrophy. Expose the third option; gate it (see combos).",
          ],
          [
            "Lift density",
            "Focus (2 mains) / Standard (~4) / Full template",
            "lift_style — extend from 2 values to 3",
            "Templates are authored in three layers: 2 compounds, accessories, SPD finishers. The engine already cuts to 2 or 4. A 1–8 slider or minute picker is false precision.",
          ],
          [
            "Sunday extras",
            "Rest / Grease-the-groove",
            "gtg_optional",
            "Sub-max sprinkle, not a third gym day. Planner emits the Sunday session from this flag alone. Quest bars on Orbit also need Arc HUD.",
          ],
        ]}
      />

      <H2>What Sunday actually changes</H2>
      <Table
        headers={["Option", "Runs", "Lifts", "Weekend"]}
        rows={[
          [
            "Short windows",
            "Mon ~35 min, skip strides; Fri long becomes ~45 min; Wed quality shortened",
            "Cap 35 min; drop to 4 lifts, or 1–2 if Focus",
            "Optional Sat bike skipped",
          ],
          [
            "Full week",
            "Mon ~45, Fri long ~70 in build, Wed full quality unless readiness cuts it",
            "Maintenance ~50 min / Strength ~55 / Hypertrophy ~60",
            "Optional easy bike",
          ],
          [
            "Peak",
            "Sharpen: Wed 5K-pace reps; Fri protect legs",
            "Block default is maintain unless you override",
            "Unchanged",
          ],
          [
            "Test",
            "No sharpen VO2 session; Wed stays strides; Fri easy + skip pickups",
            "Allows Strength without pretending the 5K is the peak",
            "Unchanged",
          ],
          [
            "Skip",
            "Same softening as Test for Wed/Fri quality",
            "Same as Test",
            "Unchanged",
          ],
          [
            "Maintain",
            "Unchanged",
            "3×8 @ RPE 7, shorter rest, concurrent-safe",
            "Unchanged",
          ],
          [
            "Strength",
            "Unchanged",
            "Heavier compounds (e.g. squat 4×5), longer rest, RPE 8",
            "Unchanged",
          ],
          [
            "Hypertrophy",
            "Unchanged in code; recoverable cost is real",
            "Higher volume (4×8 @ RPE 8, ~60 min) — fights a run-primary sharpen",
            "Unchanged",
          ],
          [
            "Focus (2)",
            "Unchanged",
            "First two compounds only, 30–35 min",
            "Unchanged",
          ],
          [
            "Standard (~4)",
            "Unchanged",
            "Compounds + key accessories; ~35 min. Same cut Short windows already applies to Full.",
            "Unchanged",
          ],
          [
            "Full template",
            "Unchanged",
            "Whole list (~7 including SPD). Sharpen/taper still auto-drops plyo/explosives and −1 set.",
            "Unchanged",
          ],
          [
            "GTG on",
            "Unchanged (must stay sub-max vs Mon easy)",
            "Unchanged",
            "Sunday extras instead of rest; quest HUD if Arc is on",
          ],
        ]}
      />

      <H2>Combinations Sunday should refuse or warn</H2>
      <Text>
        Principle 4 is one primary focus. Principle 5 is no lower grinders
        before Wed quality. Schumann 2022: concurrent work does not kill max
        strength or hypertrophy, but explosive strength suffers — worse when
        strength and aerobic work share a session. Your Tue-lift / Wed-run
        split already respects that. Volume and RPE still have to fit the
        window.
      </Text>
      <Table
        headers={["Combo", "Action", "Reason"]}
        rowTone={["danger", "danger", "warning", "warning", "info"]}
        rows={[
          [
            "Hypertrophy + Peak",
            "Refuse",
            "Two primaries. 5K block pack says lift maintenance while running is primary.",
          ],
          [
            "Hypertrophy + Short windows",
            "Refuse (or auto-drop to Strength + Focus)",
            "60 min / 4×8 @ RPE 8 does not fit a time-efficient newborn week.",
          ],
          [
            "Hypertrophy during 5K sharpen/taper",
            "Refuse until after 19 Sep (or a new strength block)",
            "Coach docs: flip hypertrophy after the 5K. Two weeks out is the wrong time to add set volume.",
          ],
          [
            "Strength or Hypertrophy + Peak",
            "Warn; prefer Race → Test",
            "This is what “lean into strength” already did. Peak + heavy lifts splits the block.",
          ],
          [
            "Full template + Short windows",
            "Warn; prefer Standard",
            "Short already trims Full to ~4 / 35 min. If they pick Full + Short, show Standard as what will actually run.",
          ],
        ]}
      />

      <H3>Allowed and currently live</H3>
      <Text>
        Short + Test + Strength + Focus + GTG. Strength with two compounds,
        race as a level-check, extras sprinkled sub-max. Compatible with Seiler
        (easy days stay easy; one quality when recovery allows) and with
        concurrent spacing.
      </Text>

      <Divider />

      <H2>Race date vs race stance</H2>
      <Text>
        You should have a date field on the strip. It writes{" "}
        <Code>profile.goals.primary.race_date</Code> — the same field Sunday
        already uses. Empty means no A-race (open / build). A future date
        starts the phase clock. After 19 Sep you type the next one, or leave
        it empty. That is how the program does not miss the next race.
      </Text>
      <Callout tone="danger" title="Expired date currently sticks in taper">
        <Text>
          <Code>phase_for_days</Code> treats any days_left ≤ 7 as taper,
          including negatives. If 19 Sep stays in the profile, Sunday 20 Sep
          onward still thinks it is race week. Must treat a past date as
          expired (open / build) until you set the next event.
        </Text>
      </Callout>
      <Table
        headers={["Control", "Kind", "Who sets it", "What Sunday does"]}
        rows={[
          [
            "Event date (strip)",
            "Active A-race, or empty",
            "You, on the fitness page",
            "Writes profile.race_date. Future → build / sharpen / taper. Past → expired, do not taper. Empty → open block.",
          ],
          [
            "Phase chip",
            "Derived, read-only",
            "Nobody — computed from that date",
            "Sharpen can still be Peak or Test. Distance does not choose stance.",
          ],
          [
            "Stance",
            "Weekly course, only if date is in the future",
            "You: Peak / Test / Skip",
            "Peak keeps quality. Test/Skip soften Wed/Fri. Hidden when date is empty or expired.",
          ],
          [
            "New mesocycle (goal:)",
            "Approve when the kind of block changes",
            "You, then a follow-up yes",
            "5K → hypertrophy primary, 5K → marathon, etc. New block_id + pack. The date field alone is not enough if the week shape must change.",
          ],
        ]}
      />
      <Text>
        Same-kind next race (another 5K, or a similar road race on Mon/Wed/Fri
        + Tue/Thu lifts): change the date, keep the engine. Different primary
        (strength block, longer distance, different week shape):{" "}
        <Code>goal:</Code> first, then set the new date.
      </Text>
      <Callout tone="warning" title="Do not auto-pick Test from the calendar">
        <Text>
          Being 14 days out is sharpen, not Test. A real peak still wants
          that Wed quality. Stance stays a choice about the date you entered.
        </Text>
      </Callout>

      <H2>Do not put on the weekly strip</H2>
      <Table
        headers={["Idea", "Where it belongs", "Why not a weekly slicer"]}
        rowTone={["neutral", "warning", "neutral", "neutral", "neutral"]}
        rows={[
          [
            "Arc / Plain HUD (and quote tone)",
            "Separate skin toggle on the card chrome",
            "Does not change load. Quest bars need Arc + GTG, but GTG itself is the training flag.",
          ],
          [
            "Lean / cut / hypertrophy-as-lean",
            "Next mesocycle (goal:), not this week",
            "“Lean into strength” is emphasis, not a deficit. Body fat is already monitored (PER + rapid-loss flags). A cut during concurrent + newborn + 5K sharpen is a new primary, which principle 4 forbids.",
          ],
          [
            "goal: 5K → strength block",
            "Approve flow, not a dropdown",
            "Swaps block_id, archives history, needs a new block pack. Slack already requires a follow-up yes.",
          ],
          [
            "Force deload",
            "AthleteState (TSB, RPE debt, sleep, lift fatigue)",
            "Sunday already eases Tue and swaps Wed quality when readiness fires. A manual override duplicates Life window.",
          ],
          [
            "Extra run day / which weekdays",
            "profile.availability (durable)",
            "5K pack locks Mon/Wed/Fri. Changing days is not a course tweak.",
          ],
          [
            "Second race-date on course.json",
            "Strip date writes profile.race_date",
            "One date. Course flags stay Peak/Test/Skip about that date, not a copy of it.",
          ],
          [
            "Lift-count slider (1–8) or session minutes",
            "Three density rungs",
            "Templates are not built as pick-N. Phase already drops SPD. Minutes fall out of density × window × phase.",
          ],
        ]}
      />

      <H2>Naming trap</H2>
      <Grid columns={2} gap={16}>
        <Card>
          <CardHeader>Lean into strength</CardHeader>
          <CardBody>
            <Text>
              Slack phrase. Sets <Code>strength_emphasis = build</Code>, which
              the engine maps to lift intent <Code>strength</Code> (low-rep
              compounds). That is the Maintain / Strength / Hypertrophy
              slicer, option two.
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Lean as a cut</CardHeader>
          <CardBody>
            <Text>
              Not a course flag. No weekly option should be labelled Lean. If
              you want a fat-loss block later, that is a <Code>goal:</Code> with
              its own pack — after the 5K, with lifting or easy aerobic as
              primary, not stacked on race week.
            </Text>
          </CardBody>
        </Card>
      </Grid>

      <H2>Contract for Sunday</H2>
      <Text>
        Weekly generation should read only these fields as athlete-chosen
        course input. Readiness (TSB, HRV, sleep, lift RPE) still overrides
        when AthleteState says cut or ease.
      </Text>
      <Table
        headers={["Field", "Type", "Default if unset"]}
        rows={[
          ["time_efficient", "bool", "false (Full week)"],
          ["race_effort", "peak | test | skip", "peak"],
          [
            "lift_intent (replace strength_emphasis)",
            "maintenance | strength | hypertrophy",
            "maintenance",
          ],
          ["lift_style", "focus | standard | full", "full (today: simplified = focus)"],
          ["gtg_optional", "bool", "false (Rest Sunday)"],
        ]}
      />

      <H2>Sources</H2>
      <Text>
        Athlete rules:{" "}
        <Link href="https://github.com/AlexTouvras/fitness-coach/blob/master/research/principles.md">
          principles.md
        </Link>{" "}
        (one primary, concurrent spacing, easy days easy);{" "}
        <Link href="https://github.com/AlexTouvras/fitness-coach/blob/master/research/blocks/5k-2026-09/README.md">
          5K block pack
        </Link>{" "}
        (lifts = maintenance);{" "}
        <Link href="https://github.com/AlexTouvras/fitness-coach/blob/master/research/blocks/strength-concurrent/README.md">
          concurrent strength pack
        </Link>{" "}
        (three intents); planner + strength_program behaviour as of local
        fitness-coach.
      </Text>
      <Text>
        External: Seiler 2010,{" "}
        <Link href="https://doi.org/10.1123/ijspp.5.3.276">
          Int J Sports Physiol Perform
        </Link>{" "}
        — most sessions low intensity, limited high-intensity; Schumann et al.
        2022,{" "}
        <Link href="https://doi.org/10.1007/s40279-021-01587-7">
          Sports Medicine
        </Link>{" "}
        — concurrent does not compromise hypertrophy or max strength, but
        explosive strength can suffer, especially same-session; Halson 2014,{" "}
        <Link href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4213373/">
          Sports Med
        </Link>{" "}
        — load monitoring should stay simple and override programmed hardness
        when fatigue shows.
      </Text>
      <Text tone="secondary" size="small">
        Could not verify: grease-the-groove as a named method is practice
        lore (sub-max frequent skill work), not a trial in the coach
        bibliography. I did not regenerate a live Sunday plan for every combo;
        run/lift minutes above are from the current planner code. I did not
        open a nutrition/RED-S protocol — the no-cut call is from principle 4
        plus the 5K pack, not from a diet paper.
      </Text>
    </Stack>
  );
}
