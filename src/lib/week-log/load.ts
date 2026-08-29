import "server-only";
import { cache } from "react";
import {
  currentIsoWeekId,
  formatWeekRange,
  normalizeWeekId,
  shiftIsoWeek,
} from "@/lib/iso-week";
import { loadCareeropsWeek } from "@/lib/week-log/careerops";
import { loadFitnessWeek } from "@/lib/week-log/fitness";
import { loadHeimdallWeek } from "@/lib/week-log/heimdall";
import { loadMealWeek } from "@/lib/week-log/mealplan";
import { loadNewsletterWeek } from "@/lib/week-log/newsletter";
import { loadRavensWeek } from "@/lib/week-log/ravens";
import type { WeekLog } from "@/lib/week-log/types";

export const loadWeekLog = cache(async (rawWeekId?: string): Promise<WeekLog> => {
  const current = currentIsoWeekId();
  const weekId = normalizeWeekId(rawWeekId, current);
  const [fitness, meals, ravens, newsletter, careerops] = await Promise.all([
    loadFitnessWeek(weekId),
    loadMealWeek(weekId),
    loadRavensWeek(weekId),
    loadNewsletterWeek(weekId),
    loadCareeropsWeek(weekId),
  ]);
  const heimdall = await loadHeimdallWeek(fitness.data);

  return {
    weekId,
    label: weekId,
    range: formatWeekRange(weekId),
    prevWeekId: shiftIsoWeek(weekId, -1),
    nextWeekId: shiftIsoWeek(weekId, 1),
    isCurrent: weekId === current,
    fitness,
    meals,
    ravens,
    heimdall,
    newsletter,
    careerops,
  };
});
