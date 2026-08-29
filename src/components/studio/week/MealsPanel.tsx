import { Lane } from "@/components/studio/week/Lane";
import type { MealWeek, WeekLane } from "@/lib/week-log/types";

export function MealsPanel({ lane }: { lane: WeekLane<MealWeek> }) {
  const meals = lane.data;

  return (
    <Lane
      eyebrow="Meals"
      title={meals?.title ?? "Meal plan"}
      status={lane.status}
      detail={lane.detail}
      stale={lane.stale}
      source={lane.source}
      href={lane.href}
    >
      {meals ? (
        <div className="space-y-5">
          {meals.goals ? (
            <p className="text-sm leading-relaxed text-slate-300">{meals.goals}</p>
          ) : null}
          {meals.days.map((day) => (
            <div key={day.heading}>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                {day.heading}
              </p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {day.meals.map((meal) => (
                  <li key={`${day.heading}-${meal.meal}`}>
                    <span className="text-slate-400">{meal.meal}: </span>
                    <span className="text-white">{meal.dish}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </Lane>
  );
}
