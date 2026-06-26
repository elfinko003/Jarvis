interface HudCornerProps {
  color?: "orange" | "blue";
}

// Ultra-subtle now (UPDATE 1) — a faint frame hint, not a glowing bracket.
// `color` is accepted for backward compatibility with existing call sites
// but no longer changes anything; every corner uses the same faint tone.
export function HudCorner(_props: HudCornerProps) {
  const border = "border-white/[0.08]";

  return (
    <>
      <span className={`pointer-events-none absolute left-0 top-0 h-3 w-3 border-l border-t ${border}`} />
      <span className={`pointer-events-none absolute right-0 top-0 h-3 w-3 border-r border-t ${border}`} />
      <span className={`pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b border-l ${border}`} />
      <span className={`pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r ${border}`} />
    </>
  );
}
