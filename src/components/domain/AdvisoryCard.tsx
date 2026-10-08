import { CalendarClock, HelpCircle, Lightbulb, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { RiskBadge, type RiskLevel } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ADVISORY_DISCLAIMER } from '@/lib/constants';

interface Props {
  title: string;
  what: string;
  when?: string;
  why?: string;
  warning?: string;
  riskLevel?: RiskLevel;
  generatedAt?: string;
  actions?: ReactNode;
  disclaimer?: string;
  children?: ReactNode;
}

function Row({ icon, label, text }: { icon: ReactNode; label: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-1 text-primary-text" aria-hidden="true">{icon}</span>
      <div><dt className="font-semibold">{label}</dt><dd className="text-muted">{text}</dd></div>
    </div>
  );
}

/** WHAT / WHEN / WHY / WARNING. The warning and disclaimer are always rendered. */
export function AdvisoryCard({ title, what, when, why, warning, riskLevel, generatedAt, actions, disclaimer, children }: Props) {
  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        {riskLevel && <RiskBadge level={riskLevel} />}
      </div>
      <dl className="space-y-3">
        <Row icon={<Lightbulb size={20} />} label="What to do" text={what} />
        {when && <Row icon={<CalendarClock size={20} />} label="When" text={when} />}
        {why && <Row icon={<HelpCircle size={20} />} label="Why" text={why} />}
        <Row icon={<TriangleAlert size={20} />} label="Warning" text={warning ?? 'No specific warning was provided. Uncertainty always remains.'} />
      </dl>
      {children}
      {generatedAt && <p className="text-sm text-muted">Generated {new Date(generatedAt).toLocaleString()}</p>}
      <p className="border-t border-subtle pt-3 text-sm text-muted">{disclaimer ?? ADVISORY_DISCLAIMER}</p>
      {actions}
    </Card>
  );
}
