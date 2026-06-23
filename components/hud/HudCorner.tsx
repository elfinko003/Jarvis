export function HudCorner() {
  return (
    <>
      <span className="pointer-events-none absolute left-0 top-0 h-3.5 w-3.5 border-l-[1.5px] border-t-[1.5px] border-orange/70" />
      <span className="pointer-events-none absolute right-0 top-0 h-3.5 w-3.5 border-r-[1.5px] border-t-[1.5px] border-orange/70" />
      <span className="pointer-events-none absolute bottom-0 left-0 h-3.5 w-3.5 border-b-[1.5px] border-l-[1.5px] border-orange/70" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-3.5 w-3.5 border-b-[1.5px] border-r-[1.5px] border-orange/70" />
    </>
  );
}
