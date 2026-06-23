import { Panel } from "@/components/hud";

interface NewsItem {
  tone: "orange" | "green" | "red";
  text: string;
  time: string;
}

const NEWS: NewsItem[] = [
  { tone: "orange", text: "Server-Cluster EU-WEST auf 98% Auslastung", time: "21:04" },
  { tone: "green", text: "Backup-Job ERFOLGREICH abgeschlossen", time: "20:51" },
  { tone: "orange", text: "Neuer Pull-Request wartet auf Review", time: "20:40" },
  { tone: "red", text: "API-Latenz kurzfristig über Schwellenwert", time: "20:22" },
  { tone: "green", text: "Nordic Forge Build #482 erfolgreich deployed", time: "19:58" },
  { tone: "orange", text: "Smart-Home: Lüftung automatisch auf Stufe 2", time: "19:40" },
];

const TONE_DOT: Record<NewsItem["tone"], string> = {
  orange: "bg-orange shadow-[0_0_4px_var(--orange)]",
  green: "bg-green shadow-[0_0_4px_var(--green)]",
  red: "bg-red shadow-[0_0_4px_var(--red)]",
};

function NewsRow({ item }: { item: NewsItem }) {
  return (
    <div className="flex items-baseline gap-2 border-b border-border-dim/50 py-1.5">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${TONE_DOT[item.tone]}`} />
      <span className="flex-1 font-mono text-[11px] text-text-dim">{item.text}</span>
      <span className="shrink-0 font-mono text-[9px] text-text-faint">{item.time}</span>
    </div>
  );
}

export function NewsFeed() {
  return (
    <Panel title="NEWS // LOG" rightText="AUTO" className="flex h-full flex-col">
      <div className="relative mt-1 min-h-0 flex-1 overflow-hidden">
        <div className="news-scroll absolute inset-x-0 top-0 flex flex-col">
          {NEWS.map((item, i) => (
            <NewsRow key={`a-${i}`} item={item} />
          ))}
          {NEWS.map((item, i) => (
            <NewsRow key={`b-${i}`} item={item} />
          ))}
        </div>
      </div>
    </Panel>
  );
}
