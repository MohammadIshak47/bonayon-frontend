import { CircleHelp, CloudOff, OctagonAlert, ShieldCheck, Thermometer, TriangleAlert, Waves } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'unknown';

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center gap-1 rounded-control border border-subtle px-2 py-0.5 text-sm', className)}>{children}</span>;
}

const RISK = {
  low: { Icon: ShieldCheck, label: 'Low risk', cls: 'text-success-text border-success/50' },
  moderate: { Icon: TriangleAlert, label: 'Moderate risk', cls: 'text-amber-text border-amber/60' },
  high: { Icon: OctagonAlert, label: 'High risk', cls: 'text-danger-text border-danger/50' },
  unknown: { Icon: CircleHelp, label: 'Risk unknown', cls: 'text-muted' },
} as const;

/** Icon + text + color: color is never the only signal. */
export function RiskBadge({ level, label }: { level: RiskLevel; label?: string }) {
  const { Icon, label: def, cls } = RISK[level];
  return <Badge className={cls}><Icon size={16} aria-hidden="true" />{label ?? def}</Badge>;
}

export type Hazard = 'heatwave' | 'dryspell' | 'flood' | 'none';
const HAZARD = {
  heatwave: { Icon: Thermometer, label: 'Heatwave', cls: 'text-danger-text border-danger/50' },
  dryspell: { Icon: CloudOff, label: 'Dry spell', cls: 'text-amber-text border-amber/60' },
  flood: { Icon: Waves, label: 'Flood', cls: 'text-climate-text border-climate/50' },
  none: { Icon: ShieldCheck, label: 'No major risk', cls: 'text-success-text border-success/50' },
} as const;
export function HazardBadge({ kind }: { kind: Hazard }) {
  const { Icon, label, cls } = HAZARD[kind];
  return <Badge className={cls}><Icon size={16} aria-hidden="true" />{label}</Badge>;
}
