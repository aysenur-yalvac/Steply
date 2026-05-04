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

const TR_DAYS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"] as const;
const TR_MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"] as const;

type Range = "7" | "14" | "30";

function buildChartData(activities: ActivityDay[], days: number) {
  // Use daily_score (weighted pts) if available, fall back to activity_count
  const map = new Map<string, number>();
  for (const a of activities) {
    map.set(a.date, a.daily_score ?? a.activity_count);
  }

  const result: { day: string; date: string; value: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const label =
      days <= 7
        ? TR_DAYS[d.getDay()]
        : days <= 14
        ? `${d.getDate()} ${TR_MONTHS[d.getMonth()]}`
        : `${d.getDate()}/${d.getMonth() + 1}`;
    result.push({ day: label, date: iso, value: map.get(iso) ?? 0 });
  }
  return result;
}

interface Props {
  activities: ActivityDay[];
  className?: string;
}

export default function ActivityChartCard({ activities, className }: Props) {
  const [range, setRange] = useState<Range>("7");

  const data = useMemo(
    () => buildChartData(activities, parseInt(range)),
    [activities, range]
  );

  const maxVal = Math.max(...data.map((d) => d.value), 1);

  const totalThisRange = data.reduce((s, d) => s + d.value, 0);
  const totalPrev = useMemo(() => {
    const n = parseInt(range);
    const map = new Map<string, number>();
    for (const a of activities) map.set(a.date, a.daily_score ?? a.activity_count);
    let sum = 0;
    const now = new Date();
    for (let i = n * 2 - 1; i >= n; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      sum += map.get(d.toISOString().slice(0, 10)) ?? 0;
    }
    return sum;
  }, [activities, range]);

  const diff = totalThisRange - totalPrev;
  const diffLabel =
    totalPrev === 0
      ? "Aktif Durum"
      : diff > 0
      ? `+${diff} önceki döneme göre`
      : diff < 0
      ? `${diff} önceki döneme göre`
      : "Önceki dönemle aynı";

  const RANGE_LABELS: Record<Range, string> = {
    "7": "Son 7 gün",
    "14": "Son 14 gün",
    "30": "Son 30 gün",
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-0 px-5 pt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-800">
              Aktivite
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">{diffLabel}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs font-medium"
              >
                {RANGE_LABELS[range]}
                <ChevronDownIcon className="w-3.5 h-3.5 text-muted-foreground/70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(["7", "14", "30"] as Range[]).map((r) => (
                <DropdownMenuItem
                  key={r}
                  onSelect={() => setRange(r)}
                  className={range === r ? "text-violet-600 font-semibold" : ""}
                >
                  {RANGE_LABELS[r]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="px-5 pt-4 pb-5">
        <div className="flex items-end gap-1.5 h-28">
          {data.map((item, i) => {
            const heightPct = (item.value / maxVal) * 100;
            return (
              <div
                key={item.date}
                className="flex flex-col items-center gap-1 flex-1 group"
              >
                <div className="relative w-full flex items-end h-20">
                  <motion.div
                    className="w-full rounded-t-md bg-violet-500 group-hover:bg-violet-600 transition-colors cursor-pointer"
                    style={{ minHeight: item.value > 0 ? 4 : 2 }}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(heightPct, item.value > 0 ? 5 : 2)}%` }}
                    transition={{
                      delay: i * 0.03,
                      type: "spring",
                      stiffness: 260,
                      damping: 22,
                    }}
                    title={`${item.value} puan`}
                  />
                  {item.value > 0 && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      +{item.value}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[9px] font-medium truncate w-full text-center ${
                    item.date === new Date().toISOString().slice(0, 10)
                      ? "text-violet-600 font-bold"
                      : "text-slate-400"
                  }`}
                >
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>{totalThisRange} toplam puan</span>
          <span className="font-bold text-slate-600">
            {RANGE_LABELS[range]}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
