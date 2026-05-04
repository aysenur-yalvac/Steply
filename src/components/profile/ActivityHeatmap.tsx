"use client";

import { useMemo, useState } from "react";

type ActivityDay = { date: string; activity_count: number };

const LEVELS = [
  { min: 0,  max: 0,         cls: "bg-slate-100",  ring: "border-slate-200" },
  { min: 1,  max: 2,         cls: "bg-violet-200", ring: "border-violet-300" },
  { min: 3,  max: 5,         cls: "bg-violet-400", ring: "border-violet-500" },
  { min: 6,  max: 10,        cls: "bg-violet-600", ring: "border-violet-700" },
  { min: 11, max: Infinity,  cls: "bg-violet-800", ring: "border-violet-900" },
];

function getLevel(count: number) {
  return LEVELS.find(l => count >= l.min && count <= l.max) ?? LEVELS[0];
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LABELS  = ["","Mon","","Wed","","Fri",""];

interface Props { activities: ActivityDay[] }

export default function ActivityHeatmap({ activities }: Props) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const { grid, monthLabels, totalCount, streak } = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of activities) map.set(a.date, a.activity_count);

    const today = new Date();
    const days: { date: string; count: number; dayOfWeek: number }[] = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().split("T")[0];
      days.push({ date: iso, count: map.get(iso) ?? 0, dayOfWeek: d.getDay() });
    }

    const leading  = days[0].dayOfWeek; // blanks before first cell
    const total    = leading + days.length;
    const weeks    = Math.ceil(total / 7);

    const grid = Array.from({ length: weeks }, (_, wi) =>
      Array.from({ length: 7 }, (_, di): typeof days[0] | null => {
        const idx = wi * 7 + di - leading;
        return idx >= 0 && idx < days.length ? days[idx] : null;
      })
    );

    // Month label per week
    const monthLabels: { label: string; weekIdx: number }[] = [];
    let lastMonth = -1;
    days.forEach((day, i) => {
      const wi = Math.floor((i + leading) / 7);
      const m  = new Date(day.date).getMonth();
      if (m !== lastMonth) { monthLabels.push({ label: MONTH_NAMES[m], weekIdx: wi }); lastMonth = m; }
    });

    // Current streak (consecutive days ending today)
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if ((map.get(d.toISOString().split("T")[0]) ?? 0) > 0) streak++;
      else break;
    }

    const totalCount = activities.reduce((s, a) => s + a.activity_count, 0);
    return { grid, monthLabels, totalCount, streak };
  }, [activities]);

  const CELL = 11; // px per cell
  const GAP  = 2;  // px gap

  return (
    <div className="space-y-2 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Activity</p>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          {streak > 0 && (
            <span className="flex items-center gap-1 font-semibold text-orange-500">
              🔥 {streak}-day streak
            </span>
          )}
          <span>{totalCount} activities this year</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="inline-block relative">
          {/* Month labels */}
          <div className="flex ml-8 mb-1 h-3 relative text-[10px] text-slate-400">
            {monthLabels.map(({ label, weekIdx }, i) => (
              <span
                key={i}
                className="absolute"
                style={{ left: (weekIdx * (CELL + GAP)) }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Main grid */}
          <div className="flex gap-[2px]">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-[2px] mr-1 w-7">
              {DAY_LABELS.map((d, i) => (
                <span key={i} style={{ height: CELL }} className="text-[10px] text-slate-300 flex items-center justify-end pr-0.5">
                  {d}
                </span>
              ))}
            </div>

            {/* Week columns */}
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {week.map((cell, di) => {
                  if (!cell) {
                    return <div key={di} style={{ width: CELL, height: CELL }} />;
                  }
                  const level = getLevel(cell.count);
                  const dateLabel = new Date(cell.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
                  const tip = cell.count === 0
                    ? `No activity — ${dateLabel}`
                    : `${cell.count} action${cell.count !== 1 ? "s" : ""} — ${dateLabel}`;
                  return (
                    <div
                      key={di}
                      style={{ width: CELL, height: CELL }}
                      className={`rounded-[2px] cursor-default transition-opacity hover:opacity-70 ${level.cls}`}
                      onMouseEnter={e => {
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        setTooltip({ text: tip, x: rect.left + rect.width / 2, y: rect.top });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip (portal-style fixed) */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-slate-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl -translate-x-1/2 -translate-y-full -mt-1 whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y - 6 }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-1 justify-end text-[10px] text-slate-400">
        <span>Less</span>
        {LEVELS.map((l, i) => (
          <div key={i} style={{ width: CELL, height: CELL }} className={`rounded-[2px] ${l.cls}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
