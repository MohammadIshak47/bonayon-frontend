import { Sprout } from 'lucide-react';
import { HazardBadge, type Hazard } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { RiskMonth } from '@/types/api';

// Display thresholds only (not scientific limits): when to show a badge on a month card.
const HEATWAVE_DAYS_BADGE = 1;
const DRY_SPELL_PERCENT_BADGE = 30; // ASSUMED: backend reports likelihood as % of years

const hazards = (m: RiskMonth): Hazard[] => {
  const h: Hazard[] = [];
  if (m.heatwave_days >= HEATWAVE_DAYS_BADGE) h.push('heatwave');
  if (m.dry_spell_likelihood >= DRY_SPELL_PERCENT_BADGE) h.push('dryspell');
  return h.length ? h : ['none'];
};

const LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 12-month timeline. Every month is text (badge + numbers), so no chart-only information. */
export function RiskCalendar({ months, basisYears }: { months: RiskMonth[]; basisYears?: number }) {
  return (
    <div>
      <ol className="stack-grid grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {months.map((m) => (
          <li key={m.month}>
            <Card className="h-full space-y-2">
              <div className="flex items-center justify-between"><h3 className="font-semibold">{LABELS[m.month - 1]}</h3>
                {m.monsoon_onset && <span className="inline-flex items-center gap-1 text-sm text-climate-text"><Sprout size={16} aria-hidden="true" />Monsoon onset</span>}
              </div>
              <div className="flex flex-wrap gap-1">{hazards(m).map((h) => <HazardBadge key={h} kind={h} />)}</div>
              <dl className="text-sm text-muted">
                <div className="flex justify-between"><dt>Heatwave days</dt><dd>{m.heatwave_days.toFixed(1)}</dd></div>
                <div className="flex justify-between"><dt>Dry-spell likelihood</dt><dd>{Math.round(m.dry_spell_likelihood)}%</dd></div>
              </dl>
            </Card>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-sm text-muted">Based on {basisYears ?? 20} years of history. Risks are past frequencies and carry uncertainty; they do not predict a specific year.</p>
    </div>
  );
}
