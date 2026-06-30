import { useMemo } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, ReferenceDot, ResponsiveContainer, Tooltip,
} from 'recharts';
import type { Blend } from '@/lib/episodeBlend';
import { fmtSignedPct } from '@/lib/scenarioPlannerView';

export interface PathChartProps {
  /** central + band; for a single episode the band collapses to the line */
  blend: Blend;
  /** the read-position path (central when r=0); pass the same as central to hide the read line */
  readPath: number[];
  /** native step label, e.g. 'month' | 'year' */
  stepUnit: 'month' | 'year';
  troughIndex: number;
}

export default function PathChart({ blend, readPath, stepUnit, troughIndex }: PathChartProps) {
  const data = useMemo(
    () =>
      blend.central.map((c, t) => ({
        t,
        central: c,
        bandLow: blend.band.min[t],
        // Recharts stacks Area from a baseline; render band as a transparent base + visible span.
        bandSpan: blend.band.max[t] - blend.band.min[t],
        read: readPath[t],
      })),
    [blend, readPath],
  );

  return (
    <div data-testid="scenario-path-chart" className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 16, bottom: 8, left: 0 }}>
          <XAxis dataKey="t" tickFormatter={(t) => `${t} ${stepUnit[0]}`} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => fmtSignedPct(v)} tick={{ fontSize: 11 }} width={48} />
          <Tooltip
            formatter={(v: number, name) => [fmtSignedPct(v), name === 'read' ? 'Reading' : 'Typical']}
            labelFormatter={(t) => `${t} ${stepUnit}s`}
          />
          {/* observed band: transparent base to bandLow, then visible span up to bandMax */}
          <Area dataKey="bandLow" stackId="band" stroke="none" fill="transparent" isAnimationActive={false} />
          <Area dataKey="bandSpan" stackId="band" stroke="none" fill="var(--muted-foreground)" fillOpacity={0.14}
                isAnimationActive={false} />
          <Line dataKey="central" stroke="var(--muted-foreground)" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line dataKey="read" stroke="var(--u-green)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
          <ReferenceDot x={troughIndex} y={readPath[troughIndex]} r={4} fill="var(--u-green)" stroke="none" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
