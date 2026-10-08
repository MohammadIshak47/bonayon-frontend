import { RiskBadge, type RiskLevel } from './Badge';

interface Props {
  cropName: string;
  score: number;
  /** Supplied by the backend contract; never assumed to be 0-100. */
  scale: { min: number; max: number };
  formattedScore?: string;
  rank?: number;
  scoreBasis?: string;
  riskLevel?: RiskLevel;
  tierLabel?: string;
}

export function CropMatchBar({ cropName, score, scale, formattedScore, rank, scoreBasis, riskLevel, tierLabel }: Props) {
  const span = scale.max - scale.min;
  const pct = span > 0 ? Math.min(100, Math.max(0, ((score - scale.min) / span) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">{rank !== undefined && `${rank}. `}{cropName}</span>
        <span className="flex items-center gap-2">
          {riskLevel && <RiskBadge level={riskLevel} />}
          {tierLabel && <span className="text-sm text-muted">{tierLabel}</span>}
          <span className="font-semibold">{formattedScore ?? score}</span>
        </span>
      </div>
      <div role="meter" aria-label={`${cropName} match`} aria-valuemin={scale.min} aria-valuemax={scale.max} aria-valuenow={score} className="h-3 overflow-hidden rounded-full bg-subtle">
        <div className={`h-full rounded-full ${pct >= 55 ? 'bg-primary' : pct >= 35 ? 'bg-amber' : 'bg-danger'}`} style={{ width: `${pct}%` }} />
      </div>
      {scoreBasis && <p className="mt-1 text-sm text-muted">{scoreBasis}</p>}
    </div>
  );
}
