// Mock daily schedule + priorities — swap for a real calendar/task source later.
export interface DayEvent {
  title: string;
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  category: "orange" | "green" | "salmon";
}

export const EVENTS: DayEvent[] = [
  { title: "Aufstehen", start: "06:30", end: "06:45", category: "orange" },
  { title: "Frühstück", start: "06:45", end: "07:15", category: "green" },
  { title: "Deep Work", start: "07:30", end: "09:30", category: "orange" },
  { title: "Schule", start: "09:45", end: "13:00", category: "salmon" },
  { title: "Lernen", start: "15:00", end: "17:00", category: "orange" },
  { title: "Nordic Forge Call", start: "16:00", end: "16:30", category: "green" },
];

export type PriorityLevel = "critical" | "medium" | "done";

export interface PriorityItem {
  title: string;
  subtitle: string;
  priority: PriorityLevel;
  estimateMinutes: number;
}

export const PRIORITIES: PriorityItem[] = [
  {
    title: "Nordic Forge Release vorbereiten",
    subtitle: "Build testen + Changelog schreiben",
    priority: "critical",
    estimateMinutes: 90,
  },
  { title: "Matheaufgaben", subtitle: "Kapitel 7, Übung 3 bis 9", priority: "medium", estimateMinutes: 45 },
  { title: "E-Mails beantworten", subtitle: "Posteingang aufräumen", priority: "medium", estimateMinutes: 20 },
  { title: "Morgenroutine", subtitle: "Aufstehen + Frühstück", priority: "done", estimateMinutes: 30 },
];

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
