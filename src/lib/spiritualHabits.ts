export const DEFAULT_HABIT_ORDER = [
  'Fajr',
  'Zuhur',
  'Asr',
  'Maghrib',
  'Isha',
  'Azkaar',
  'Quran Memorisation',
  'Tahajjud',
] as const;

export const DEFAULT_HABIT_NAMES = new Set<string>(DEFAULT_HABIT_ORDER);

export function isDefaultSpiritualHabit(name: string): boolean {
  return DEFAULT_HABIT_NAMES.has(name);
}

export const PRAYER_HABIT_NAMES = new Set<string>([
  'Fajr',
  'Zuhur',
  'Asr',
  'Maghrib',
  'Isha',
]);

export const OPTIONAL_HABIT_NAMES = new Set<string>([
  'Tahajjud',
  'Quran Memorisation',
]);

const defaultOrderMap = new Map<string, number>(DEFAULT_HABIT_ORDER.map((name, index) => [name, index]));

function getSpiritualHabitSortKey(name: string, id = Number.MAX_SAFE_INTEGER): number {
  const defaultIndex = defaultOrderMap.get(name);
  if (defaultIndex !== undefined) return defaultIndex;
  return DEFAULT_HABIT_ORDER.length + id;
}

export function sortSpiritualHabits<T extends { name: string; id?: number }>(habits: T[]): T[] {
  return [...habits].sort((a, b) => {
    const sortDiff = getSpiritualHabitSortKey(a.name, a.id) - getSpiritualHabitSortKey(b.name, b.id);
    if (sortDiff !== 0) return sortDiff;
    return a.name.localeCompare(b.name);
  });
}

export interface SpiritualHistoryHabit {
  name: string;
  isCompleted: boolean;
  prayedWithJamaat: boolean;
}

export function mergeHistoryHabits(
  recordHabits: SpiritualHistoryHabit[],
  allHabits: Array<{ id: number; name: string }>,
): SpiritualHistoryHabit[] {
  const recordByName = new Map(recordHabits.map(habit => [habit.name, habit]));
  const knownNames = new Set<string>();

  const merged = sortSpiritualHabits(allHabits).map(habit => {
    knownNames.add(habit.name);
    const logged = recordByName.get(habit.name);
    return {
      name: habit.name,
      isCompleted: logged?.isCompleted ?? false,
      prayedWithJamaat: logged?.prayedWithJamaat ?? false,
    };
  });

  for (const habit of recordHabits) {
    if (!knownNames.has(habit.name)) {
      merged.push(habit);
      knownNames.add(habit.name);
    }
  }

  return merged;
}
