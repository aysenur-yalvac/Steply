"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityDay } from "@/lib/actions";

type Range = "7d" | "1m" | "1y" | "all";

interface DataPoint {
  label: string;
  value: number;
}

const RANGE_OPTIONS: { label: string; value: Range }[] = [
  { label: "Son 7 Gün",     value: "7d"  },
  { label: "Son 1 Ay",      value: "1m"  },
  { label: "Son 1 Yıl",     value: "1y"  },
  { label: "Tüm Zamanlar",  value: "all" },
];

const TR_MONTHS = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
const TR_DAYS   = ["Paz","Pzt","Sal","Çar","Per","Cum","Cmt"];

// Reads local year/month/day — avoids UTC-offset day shift (e.g. UTC+3 Turkey)
function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

// Parse any date string as local midnight.
// .slice(0,10) extracts YYYY-MM-DD from both bare dates and full timestamps,
// preventing "YYYY-MM-DDTHH:mm:ssT00:00:00" invalid string when the DB
// returns a timestamp instead of a plain DATE value.
function parseLocalDate(iso: string): Date {
  return new Date(iso.slice(0, 10) + "T00:00:00");
}

function processActivities(activities: ActivityDay[], range: Range): DataPoint[] {
  // Normalize — safe even when activities is empty
  const normalized = activities.map(a => ({
    date: localDateStr(parseLocalDate(a.date)),
    value: a.daily_score ?? a.activity_count,
  }));

  // Local-time "today" at midnight — all date math stays in local timezone
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // 7d: always zero-fill last 7 days; built from full normalized so no cutoff edge-case
  if (range === "7d") {
    const valMap = new Map(normalized.map(d => [d.date, d.value]));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      const iso = localDateStr(d);
      return { label: TR_DAYS[d.getDay()], value: valMap.get(iso) ?? 0 };
    });
  }

  if (!normalized.length) return [{ label: "—", value: 0 }];

  // Filter by range for 1m / 1y
  let filtered = normalized;
  if (range === "1m") {
    const cutoff = new Date(now); cutoff.setMonth(now.getMonth() - 1);
    filtered = normalized.filter(d => parseLocalDate(d.date) >= cutoff);
  } else if (range === "1y") {
    const cutoff = new Date(now); cutoff.setFullYear(now.getFullYear() - 1);
    filtered = normalized.filter(d => parseLocalDate(d.date) >= cutoff);
  }

  if (range === "1y" || range === "all") {
    if (!filtered.length) return [{ label: "—", value: 0 }];
    // Group by month — preserve chronological order
    const monthMap = new Map<string, number>();
    for (const d of filtered) {
      const date = parseLocalDate(d.date);
      const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2,"0")}`;
      monthMap.set(key, (monthMap.get(key) ?? 0) + d.value);
    }
    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const monthIndex = parseInt(key.split("-")[1], 10);
        return { label: TR_MONTHS[monthIndex], value };
      });
  }

  // 1m: zero-fill each day in the last ~30 days
  if (range === "1m") {
    const valMap = new Map(normalized.map(d => [d.date, d.value]));
    const cutoff = new Date(now); cutoff.setMonth(now.getMonth() - 1);
    const days: DataPoint[] = [];
    const cur = new Date(cutoff);
    cur.setDate(cur.getDate() + 1);
    while (cur <= now) {
      const iso = localDateStr(cur);
      days.push({ label: `${cur.getDate()}/${cur.getMonth()+1}`, value: valMap.get(iso) ?? 0 });
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }

  return filtered.map(d => ({ label: d.date, value: d.value }));
}

interface Props {
  activities: ActivityDay[];
  totalScore?: number;
  title?: string;
  className?: string;
}

export default function ActivityChartCard({ activities, totalScore, title = "Aktivite Puanları", className }: Props) {
  const [range, setRange] = React.useState<Range>("7d");

  const processedData = React.useMemo(
    () => processActivities(activities, range),
    [activities, range],
  );

  // totalScore prop = real cumulative score from profiles.total_score
  // Falls back to summing daily_score values if not provided
  const displayTotal = totalScore ?? activities.reduce((s, a) => s + (a.daily_score ?? a.activity_count), 0);
  const maxValue = Math.max(...processedData.map(d => d.value), 1);
  const selectedLabel = RANGE_OPTIONS.find(o => o.value === range)?.label;

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const isLarge = range === "1m" || range === "1y" || range === "all";

  return (
    <Card className={cn("w-full bg-white border border-slate-200 shadow-sm", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-900">{title}</CardTitle>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md border border-violet-200 bg-white text-violet-700 hover:bg-violet-50 transition-colors"
            >
              {selectedLabel}
              <ChevronDown className="h-3 w-3" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 shadow-xl rounded-md overflow-hidden z-[9999] flex flex-col py-1">
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setRange(opt.value);
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "text-left px-3 py-2 text-xs transition-colors hover:bg-slate-100",
                      range === opt.value ? "text-violet-700 font-bold bg-violet-50" : "text-slate-700 font-medium"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col mt-2">
          <p className="text-4xl font-bold tracking-tight text-slate-900">
            {displayTotal.toLocaleString("tr-TR")}{" "}
            <span className="text-sm text-slate-500 font-normal">Puan</span>
          </p>
          <div className="flex items-center gap-1 text-emerald-600 font-bold mt-1 text-xs">
            <TrendingUp className="h-3 w-3" />
            Aktif gelişim
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className={cn("mt-4", isLarge && "overflow-x-auto pb-1")}>
          <div
            className="flex h-32 items-end justify-between gap-[3px]"
            style={isLarge ? { minWidth: `${processedData.length * 22}px` } : undefined}
          >
            <AnimatePresence mode="wait">
              {processedData.map((item, i) => (
                <div
                  key={`${range}-${item.label}-${i}`}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1.5 group"
                >
                  <div className="relative w-full flex items-end" style={{ height: "calc(100% - 20px)" }}>
                    <motion.div
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      exit={{ scaleY: 0, opacity: 0 }}
                      transition={{ delay: i * 0.02, type: "spring", stiffness: 300, damping: 28 }}
                      className="w-full rounded-t-sm bg-violet-600 hover:bg-violet-700 transition-colors cursor-pointer"
                      style={{
                        height: `${Math.max((item.value / maxValue) * 100, 3)}%`,
                        originY: 1,
                      }}
                      title={`${item.label}: ${item.value} puan`}
                    />
                    {item.value > 0 && (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        +{item.value}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-600 font-semibold uppercase truncate w-full text-center leading-none">
                    {item.label}
                  </span>
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
