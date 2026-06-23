// Personal metrics only — no business/work data per the build spec. All
// static/mock for now; swap individual fields for real trackers later
// (Apple Health, a reading-log app, Nordic Forge's own task DB, ...).

export interface ChangeMetric {
  kind: "change";
  label: string;
  value: number;
  unit?: string;
  changePercent: number;
}

export interface ProgressBarMetric {
  kind: "progress_bar";
  label: string;
  value: number;
  unit?: string;
  goal: number;
}

export interface SparklineMetric {
  kind: "sparkline";
  label: string;
  value: number;
  unit?: string;
  history: number[];
}

export interface ProgressRingMetric {
  kind: "progress_ring";
  label: string;
  value: number;
  unit?: string;
  percent: number;
}

export type Metric = ChangeMetric | ProgressBarMetric | SparklineMetric | ProgressRingMetric;

export interface FeaturedMetric {
  label: string;
  value: number;
  unit?: string;
  changePercent: number;
  history: number[];
}

export const FEATURED_METRIC: FeaturedMetric = {
  label: "WORKOUT-STREAK",
  value: 18,
  unit: "TAGE",
  changePercent: 12.5,
  history: [9, 10, 11, 12, 12, 13, 14, 14, 15, 16, 16, 17, 17, 18],
};

export const METRICS: Metric[] = [
  {
    kind: "sparkline",
    label: "LERNSTUNDEN DIESE WOCHE",
    value: 13.5,
    unit: "H",
    history: [1.5, 2, 1, 2.5, 2, 2.5, 2],
  },
  {
    kind: "change",
    label: "GELESENE SEITEN",
    value: 214,
    unit: "SEITEN",
    changePercent: 8.2,
  },
  {
    kind: "progress_bar",
    label: "WASSER-INTAKE",
    value: 1.8,
    unit: "L",
    goal: 2.5,
  },
  {
    kind: "change",
    label: "NORDIC FORGE · AKTIVE TASKS",
    value: 7,
    changePercent: -14.3,
  },
  {
    kind: "progress_bar",
    label: "NORDIC FORGE · ERLEDIGT",
    value: 23,
    unit: "/ 30",
    goal: 30,
  },
  {
    kind: "progress_ring",
    label: "MEILENSTEIN-FORTSCHRITT",
    value: 67,
    unit: "%",
    percent: 67,
  },
  {
    kind: "progress_ring",
    label: "TAGE BIS PRÜFUNG",
    value: 14,
    unit: "TAGE",
    percent: 76,
  },
  {
    kind: "progress_bar",
    label: "SCHRITTE HEUTE",
    value: 6420,
    goal: 10000,
  },
];
