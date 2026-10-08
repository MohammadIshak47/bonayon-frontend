import { Check } from 'lucide-react';
import { AdvisoryCard } from '@/components/domain/AdvisoryCard';
import { Card } from '@/components/ui/Card';
import { CropMatchBar } from '@/components/ui/CropMatchBar';
import { toStringList, type CropChoicePayload, type Recommendation, type SeasonPlanPayload } from '@/types/api';
import { advisoryFromRecommendation } from './advisory';

const TIER = { excellent: 'Excellent', good: 'Good', marginal: 'Marginal', poor: 'Poor' } as const;

export function CropResults({ rec }: { rec: Recommendation }) {
  const results = ((rec.payload ?? {}) as Partial<CropChoicePayload>).results ?? [];
  const a = advisoryFromRecommendation(rec);
  return (
    <div className="space-y-4">
      {results.length === 0 ? <Card><p className="text-muted">No crops could be scored with the available data.</p></Card> : (
        <ul className="space-y-3">
          {results.slice(0, 5).map((c, i) => (
            <li key={c.crop_id}><Card className="space-y-3">
              <CropMatchBar cropName={c.name_en} rank={i + 1} score={c.score} scale={{ min: 0, max: 100 }} formattedScore={`${Math.round(c.score)}/100`} tierLabel={TIER[c.tier]} />
              <ul className="space-y-1 text-muted">{c.explanations.map((x) => <li key={x} className="flex gap-2"><Check size={16} className="mt-1 shrink-0" aria-hidden="true" /><span>{x}</span></li>)}</ul>
              {c.risk_notes?.map((n) => <p key={n} className="text-amber-text">{n}</p>)}
            </Card></li>
          ))}
        </ul>
      )}
      <AdvisoryCard title={a.title} what={a.what} when={a.when} why={a.why} warning={a.warning} generatedAt={a.generatedAt} disclaimer={a.disclaimer}>
        {rec.type === 'season_plan' && toStringList(rec.explanations).length > 0 && (
          <div><h3 className="font-semibold">Influencing factors</h3><ul className="list-disc pl-5 text-muted">{toStringList(rec.explanations).map((x) => <li key={x}>{x}</li>)}</ul></div>
        )}
        {rec.type === 'season_plan' && ((rec.payload ?? {}) as SeasonPlanPayload).crop?.explanations.length ? (
          <ul className="list-disc pl-5 text-muted">{((rec.payload ?? {}) as SeasonPlanPayload).crop?.explanations.map((x) => <li key={x}>{x}</li>)}</ul>
        ) : null}
      </AdvisoryCard>
    </div>
  );
}
