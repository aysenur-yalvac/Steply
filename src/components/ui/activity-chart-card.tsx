"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import type { ActivityDay } from "@/lib/actions";

const TR_DAYS   = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"] as const;
const TR_MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"] as const;

function getLocalDateString(d: Date): string {
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day   = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type Range = 7 | 30 | 365 | "all";

const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: 7,     label: "Son 7 Gün"   },
  { value: 30,    label: "Son 1 Ay"    },
  { value: 365,   label: "Son 1 Yıl"   },
  { value: "all", label: "Tüm Zamanlar" },
];

interface ChartItem { day: string; date: string; value: number }

function buildChartData(activities: ActivityDay[], range: Range): ChartItem[] {
  const scoreMap = new Map<string, number>();
  for (const a of activities) {
    // Normalize DB date string through local-time path to match lookup keys.
    // "YYYY-MM-DD" parsed as UTC would shift by +3h in Turkey; appending
    // T00:00:00 forces local midnight interpretation.
    const normalizedKey = getLocalDateString(new Date(a.date + "T00:00:00"));
    scoreMap.set(normalizedKey, a.daily_score ?? a.activity_count);
  }
  console.log("Ham Gelen Data:", activities);
  console.log("Eşleşme İçin Oluşan Map:", scoreMap);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startDate: Date;
  if (range === "all") {
    if (activities.length === 0) {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
    } else {
      startDate = new Date(activities[0].date + "T00:00:00");
    }
  } else {
    startDate = new Date(today);
    startDate.setDate(today.getDate() - (range - 1));
  }

  const totalDays = Math.round((today.getTime() - startDate.getTime()) / 86_400_000) + 1;

  const result: ChartItem[] = [];
  const cur = new Date(startDate);
  while (cur <= today) {
    const iso = getLocalDateString(cur);
    let label: string;
    if (totalDays <= 7) {
      label = TR_DAYS[cur.getDay()];
    } else if (totalDays <= 31) {
      label = `${cur.getDate()}/${cur.getMonth() + 1}`;
    } else {
      // For large ranges: show month name only on 1st of month, else empty
      label = cur.getDate() === 1 ? TR_MONTHS[cur.getMonth()] : "";
    }
    result.push({ day: label, date: iso, value: scoreMap.get(iso) ?? 0 });
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

function getPrevTotal(activities: ActivityDay[], range: Range): number {
  if (range === "all") return 0;
  const map = new Map<string, number>();
  for (const a of activities) {
    map.set(getLocalDateString(new Date(a.date + "T00:00:00")), a.daily_score ?? a.activity_count);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let sum = 0;
  for (let i = range * 2 - 1; i >= range; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    sum += map.get(getLocalDateString(d)) ?? 0;
  }
  return sum;
}

interface Props {
  activities: ActivityDay[];
  className?: string;
}

export default function ActivityChartCard({ activities, className }: Props) {
  const [range, setRange] = useState<Range>(7);

  const data = useMemo(() => buildChartData(activities, range), [activities, range]);
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const totalCurrent = data.reduce((s, d) => s + d.value, 0);
  const totalPrev = useMemo(() => getPrevTotal(activities, range), [activities, range]);

  const diffLabel = useMemo(() => {
    if (range === "all" || totalPrev === 0) return "Tüm aktivite puanları";
    const diff = totalCurrent - totalPrev;
    if (diff > 0) return `+${diff} önceki döneme göre`;
    if (diff < 0) return `${diff} önceki döneme göre`;
    return "Önceki dönemle aynı";
  }, [range, totalPrev, totalCurrent]);

  const rangeLabel = RANGE_OPTIONS.find((o) => o.value === range)?.label ?? "";

  // For large ranges, use fixed-width bars and horizontal scroll
  const isLarge = range === 365 || range === "all";
  const barMinW = isLarge ? "min-w-[5px] max-w-[5px]" : "flex-1";
  // Minimum total width for scroll container: bars * (minWidth + gap)
  const scrollMinWidth = isLarge ? `${data.length * 7}px` : undefined;

  return (
    <Card className={className}>
      <CardHeader className="pb-0 px-5 pt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-800">
              Aktivite Puanları
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">{diffLabel}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium shrink-0">
                {rangeLabel}
                <ChevronDownIcon className="w-3.5 h-3.5 text-muted-foreground/70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {RANGE_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={String(opt.value)}
                  onSelect={() => setRange(opt.value)}
                  className={range === opt.value ? "text-violet-600 font-semibold" : ""}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="px-5 pt-4 pb-5">
        {/* Scrollable wrapper for large ranges */}
        <div
          className={isLarge ? "overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-violet-200 scrollbar-track-transparent" : ""}
        >
          <div
            className="flex items-end gap-[2px] h-28"
            style={scrollMinWidth ? { minWidth: scrollMinWidth } : undefined}
          >
            {data.map((item, i) => {
              const heightPct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
              const todayIso = getLocalDateString(new Date());
              return (
                <div
                  key={item.date}
                  className={`flex flex-col items-center gap-[3px] ${barMinW} group`}
                >
                  <div className="relative w-full flex items-end h-[76px]">
                    <motion.div
                      className="w-full rounded-t-[2px] bg-violet-500 group-hover:bg-violet-600 transition-colors cursor-pointer"
                      initial={{ height: 0 }}
                      animate={{
                        height: `${Math.max(heightPct, item.value > 0 ? 4 : 1)}%`,
                      }}
                      transition={{
                        delay: isLarge ? 0 : i * 0.025,
                        type: "spring",
                        stiffness: 280,
                        damping: 24,
                      }}
                      title={`${item.date}: ${item.value} puan`}
                    />
                    {!isLarge && item.value > 0 && (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        +{item.value}
                      </span>
                    )}
                  </div>
                  {item.day && (
                    <span
                      className={`text-[9px] font-medium text-center leading-none ${
                        item.date === todayIso
                          ? "text-violet-600 font-bold"
                          : "text-slate-400"
                      } ${isLarge ? "min-w-[28px]" : "truncate w-full"}`}
                    >
                      {item.day}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>
            <span className="font-bold text-violet-600">{totalCurrent.toLocaleString("tr-TR")}</span>{" "}
            toplam puan
          </span>
          <span className="font-semibold text-slate-500">{rangeLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}
