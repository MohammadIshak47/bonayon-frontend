import { useState } from 'react';
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { usePreferences } from '@/app/providers/PreferencesProvider';
import { Button } from '@/components/ui/Button';

export interface ChartSeries { key: string; label: string; type: 'bar' | 'line'; axis?: 'left' | 'right'; unit?: string }
type Row = Record<string, string | number | null>;
interface Props { title: string; data: Row[]; xKey: string; series: ChartSeries[]; summary: string; caption?: string; leftUnit?: string; rightUnit?: string }

const PALETTE = { light: ['#0277BD', '#B45309', '#2E7D32', '#7B1FA2', '#6D4C41'], dark: ['#4FC3F7', '#FBBF24', '#81C784', '#CE93D8', '#BCAAA4'] };
const AXIS = { light: { grid: '#E2E6DF', text: '#5A645A' }, dark: { grid: '#2E362E', text: '#A3AEA3' } };
const DASH = ['0', '6 3', '2 3', '8 3 2 3', '1 4'];

/** Theme-aware chart with an always-available table alternative. null = gap, never 0. */
export function ClimateChart({ title, data, xKey, series, summary, caption, leftUnit, rightUnit }: Props) {
  const { resolvedTheme } = usePreferences();
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const colors = PALETTE[resolvedTheme];
  const ax = AXIS[resolvedTheme];
  const hasRight = series.some((s) => s.axis === 'right');
  return (
    <figure>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <figcaption className="text-lg font-semibold">{title}</figcaption>
        <div className="flex gap-2" role="group" aria-label="View">
          <Button variant={view === 'chart' ? 'primary' : 'outline'} aria-pressed={view === 'chart'} onClick={() => setView('chart')}>Chart</Button>
          <Button variant={view === 'table' ? 'primary' : 'outline'} aria-pressed={view === 'table'} onClick={() => setView('table')}>Table</Button>
        </div>
      </div>
      <p className="mb-2 text-muted">{summary}</p>
      {view === 'chart' ? (
        <div className="h-80 w-full" role="img" aria-label={summary}>
          <ResponsiveContainer>
            <ComposedChart data={data} margin={{ top: 8, right: hasRight ? 4 : 12, bottom: 0, left: -8 }}>
              <CartesianGrid stroke={ax.grid} vertical={false} />
              <XAxis dataKey={xKey} stroke={ax.text} />
              <YAxis yAxisId="left" stroke={ax.text} unit={leftUnit ? ` ${leftUnit}` : undefined} width={leftUnit && leftUnit.length > 2 ? 62 : 44} />
              {hasRight && <YAxis yAxisId="right" orientation="right" stroke={ax.text} unit={rightUnit ? ` ${rightUnit}` : undefined} width={44} />}
              <Tooltip contentStyle={{ background: 'rgb(var(--surface-raised))', border: '1px solid rgb(var(--border-subtle))', color: 'rgb(var(--text))' }} />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 8 }} />
              {series.map((s, i) => {
                const common = { key: s.key, dataKey: s.key, name: s.label, yAxisId: s.axis ?? 'left' };
                const color = colors[i % colors.length] as string;
                return s.type === 'bar'
                  ? <Bar {...common} fill={color} />
                  : <Line {...common} stroke={color} strokeWidth={2} strokeDasharray={DASH[i % DASH.length]} connectNulls={false} dot={false} />;
              })}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b border-subtle"><th className="py-2 pr-4">{xKey}</th>{series.map((s) => <th key={s.key} className="pr-4">{s.label}{s.unit ? ` (${s.unit})` : ''}</th>)}</tr></thead>
            <tbody>{data.map((r) => (
              <tr key={String(r[xKey])} className="border-b border-subtle"><td className="py-2 pr-4">{r[xKey]}</td>{series.map((s) => <td key={s.key} className="pr-4">{r[s.key] ?? 'no data'}</td>)}</tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {caption && <p className="mt-2 text-sm text-muted">{caption}</p>}
    </figure>
  );
}
