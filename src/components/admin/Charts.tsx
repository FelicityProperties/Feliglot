"use client";

import { useEffect, useRef, useState } from "react";

// Small, dependency-free SVG charts for the owner dashboard. One series per
// chart (one axis each), thin marks, recessive grid, and a hover/focus
// tooltip; every value is also in the table view below the charts.

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.floor(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

// Clean axis maximum and ticks: 0, then round whole-number steps (these are counts).
function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1];
  const raw = Math.max(max / count, 1);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => +(i * step).toFixed(6));
}

const fmt = (n: number) => n.toLocaleString("en-US");
const shortDate = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

type Point = { day: string; value: number; extra?: [string, number][] };

function Tooltip({ x, width, p, label }: { x: number; width: number; p: Point; label: string }) {
  const left = Math.min(Math.max(x - 80, 0), Math.max(width - 160, 0));
  return (
    <div className="pointer-events-none absolute top-0 z-10 w-40 rounded-xl border border-sand-300 bg-card p-2.5 text-xs shadow-lift" style={{ left }}>
      <p className="text-ink-500">{shortDate(p.day)}</p>
      <p className="flex items-center gap-2">
        <span className="inline-block h-0.5 w-3 rounded" style={{ background: "var(--chart)" }} aria-hidden />
        <strong className="text-sm text-ink-900">{fmt(p.value)}</strong>
        <span className="text-ink-500">{label}</span>
      </p>
      {p.extra?.map(([k, v]) => (
        <p key={k} className="text-ink-600">
          <strong className="text-ink-900">{fmt(v)}</strong> {k}
        </p>
      ))}
    </div>
  );
}

export function AreaChart({ data, label, height = 240 }: { data: Point[]; label: string; height?: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { l: 44, r: 12, t: 12, b: 26 };
  const ticks = niceTicks(Math.max(0, ...data.map((d) => d.value)));
  const top = ticks[ticks.length - 1];
  const w = Math.max(width - pad.l - pad.r, 1);
  const h = height - pad.t - pad.b;
  const x = (i: number) => pad.l + (data.length > 1 ? (i / (data.length - 1)) * w : w / 2);
  const y = (v: number) => pad.t + h - (v / top) * h;
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join("");
  const area = data.length ? `${line}L${x(data.length - 1)},${pad.t + h}L${x(0)},${pad.t + h}Z` : "";
  const labelEvery = Math.ceil(data.length / 6);
  const last = data.length - 1;

  function pick(clientX: number, rect: DOMRect) {
    const rel = clientX - rect.left - pad.l;
    const i = Math.round((rel / w) * (data.length - 1));
    setHover(Math.min(Math.max(i, 0), last));
  }

  return (
    <div ref={ref} className="relative">
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={`${label} per day, line chart. Values are listed in the table below.`}
          tabIndex={0}
          className="touch-pan-y outline-none"
          onPointerMove={(e) => pick(e.clientX, e.currentTarget.getBoundingClientRect())}
          onPointerLeave={() => setHover(null)}
          onFocus={() => setHover(last)}
          onBlur={() => setHover(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setHover((h) => Math.max((h ?? last) - 1, 0));
            if (e.key === "ArrowRight") setHover((h) => Math.min((h ?? last) + 1, last));
          }}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={pad.l + w} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth={1} />
              <text x={pad.l - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-ink-500 text-[11px]">
                {fmt(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) =>
            i % labelEvery === 0 || i === last ? (
              <text key={d.day} x={x(i)} y={height - 6} textAnchor={i === 0 ? "start" : i === last ? "end" : "middle"} className="fill-ink-500 text-[11px]">
                {shortDate(d.day)}
              </text>
            ) : null,
          )}
          <path d={area} fill="var(--chart)" opacity={0.1} />
          <path d={line} fill="none" stroke="var(--chart)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {data.length > 0 && (
            <>
              <circle cx={x(last)} cy={y(data[last].value)} r={4} fill="var(--chart)" stroke="var(--card)" strokeWidth={2} />
              <text x={x(last) - 8} y={Math.max(y(data[last].value) - 10, pad.t + 10)} textAnchor="end" className="fill-ink-900 text-xs font-bold">
                {fmt(data[last].value)}
              </text>
            </>
          )}
          {hover !== null && data[hover] && (
            <>
              <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + h} stroke="var(--muted-foreground)" strokeWidth={1} />
              <circle cx={x(hover)} cy={y(data[hover].value)} r={4} fill="var(--chart)" stroke="var(--card)" strokeWidth={2} />
            </>
          )}
        </svg>
      )}
      {hover !== null && data[hover] && <Tooltip x={x(hover)} width={width} p={data[hover]} label={label} />}
    </div>
  );
}

export function ColumnChart({ data, label, height = 140 }: { data: Point[]; label: string; height?: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { l: 32, r: 4, t: 8, b: 20 };
  const ticks = niceTicks(Math.max(0, ...data.map((d) => d.value)), 2);
  const top = ticks[ticks.length - 1];
  const w = Math.max(width - pad.l - pad.r, 1);
  const h = height - pad.t - pad.b;
  const slot = w / Math.max(data.length, 1);
  const bar = Math.max(Math.min(slot - 2, 24), 1); // 2px surface gap, 24px cap
  const y = (v: number) => pad.t + h - (v / top) * h;
  const last = data.length - 1;

  return (
    <div ref={ref} className="relative">
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={`${label} per day, column chart. Values are listed in the table below.`}
          tabIndex={0}
          className="outline-none"
          onPointerLeave={() => setHover(null)}
          onFocus={() => setHover(last)}
          onBlur={() => setHover(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setHover((v) => Math.max((v ?? last) - 1, 0));
            if (e.key === "ArrowRight") setHover((v) => Math.min((v ?? last) + 1, last));
          }}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={pad.l + w} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth={1} />
              <text x={pad.l - 6} y={y(t)} dy="0.32em" textAnchor="end" className="fill-ink-500 text-[10px]">
                {fmt(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = pad.l + slot * i + slot / 2;
            const bh = top ? (d.value / top) * h : 0;
            const r = Math.min(4, bar / 2, bh);
            const x0 = cx - bar / 2;
            const yb = pad.t + h;
            // 4px rounded data-end, square at the baseline.
            const path =
              bh > 0
                ? `M${x0},${yb}V${yb - bh + r}Q${x0},${yb - bh} ${x0 + r},${yb - bh}H${x0 + bar - r}Q${x0 + bar},${yb - bh} ${x0 + bar},${yb - bh + r}V${yb}Z`
                : "";
            return (
              <g key={d.day} onPointerEnter={() => setHover(i)}>
                <rect x={pad.l + slot * i} y={pad.t} width={slot} height={h} fill="transparent" />
                {path && <path d={path} fill="var(--chart)" opacity={hover === null || hover === i ? 1 : 0.55} />}
              </g>
            );
          })}
          <text x={pad.l} y={height - 4} className="fill-ink-500 text-[10px]">
            {data[0] ? shortDate(data[0].day) : ""}
          </text>
          <text x={pad.l + w} y={height - 4} textAnchor="end" className="fill-ink-500 text-[10px]">
            {data[last] ? shortDate(data[last].day) : ""}
          </text>
        </svg>
      )}
      {hover !== null && data[hover] && <Tooltip x={pad.l + slot * hover + slot / 2} width={width} p={data[hover]} label={label} />}
    </div>
  );
}

// Ranked list with thin bars; values in text tokens at the bar's tip.
export function RankBars({ rows, label }: { rows: { key: string; label: string; count: number }[]; label: string }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  if (!rows.length) return <p className="text-sm text-ink-500">No data yet.</p>;
  return (
    <ol className="space-y-2.5" aria-label={label}>
      {rows.map((r) => (
        <li key={r.key} className="grid grid-cols-[minmax(0,7.5rem)_1fr_auto] items-center gap-3 text-sm" title={`${r.label}: ${fmt(r.count)}`}>
          <span className="truncate text-ink-700">{r.label}</span>
          <span className="h-2.5 rounded-r-[4px]" style={{ width: `${Math.max((r.count / max) * 100, 1.5)}%`, background: "var(--chart)" }} aria-hidden />
          <strong className="text-ink-900 tabular-nums">{fmt(r.count)}</strong>
        </li>
      ))}
    </ol>
  );
}
