import { cv, type CvExperience } from "@/content/cv";
import { PlaceLink } from "@/components/about/PlaceLink";
import { ScrollSpot } from "@/components/story/ScrollSpot";

function eraLabel(exp: CvExperience): string {
  const last = exp.roles[0]?.period ?? "";
  const first = exp.roles[exp.roles.length - 1]?.period ?? last;
  const start = first.split("–")[0]?.trim() ?? "";
  const end = last.includes("Present") ? "Now" : last.split("–")[1]?.trim() ?? "";
  const startYear = start.match(/\d{4}/)?.[0] ?? start;
  const endYear = end === "Now" ? "Now" : end.match(/\d{4}/)?.[0] ?? end;
  return startYear === endYear ? startYear : `${startYear} – ${endYear}`;
}

export function ExperienceTimeline() {
  return (
    <ol className="mt-10">
      {cv.experience.map((exp, i) => (
        <li key={exp.company} className="border-t border-white/10">
          <ScrollSpot className="grid gap-3 py-10 sm:grid-cols-[9rem_1fr] sm:gap-10">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
              <span className="orbit-accent tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-2 block text-slate-400">{eraLabel(exp)}</span>
            </p>
            <div>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <PlaceLink
                  href={exp.url}
                  name={exp.company}
                  logo={exp.logo}
                />
                <span className="font-mono text-xs uppercase tracking-wide text-slate-400">
                  {exp.location}
                </span>
              </div>
              <div className="mt-6 space-y-8">
                {exp.roles.map((role) => (
                  <div key={role.title + role.period}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className="orbit-accent font-medium">{role.title}</p>
                      <p className="font-mono text-xs text-slate-400">
                        {role.period}
                      </p>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {role.bullets.map((b) => (
                        <li
                          key={b}
                          className="relative pl-4 text-sm leading-relaxed text-slate-300 before:absolute before:left-0 before:top-2.5 before:h-1 before:w-1 before:rounded-full before:bg-slate-500"
                        >
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </ScrollSpot>
        </li>
      ))}
    </ol>
  );
}
