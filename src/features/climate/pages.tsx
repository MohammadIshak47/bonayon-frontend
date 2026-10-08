import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { ClimateChart } from '@/components/domain/ClimateChart';
import { Disclaimer, FreshnessNote } from '@/components/domain/Freshness';
import { RiskCalendar } from '@/components/domain/RiskCalendar';
import { QueryState } from '@/components/feedback/QueryState';
import { EmptyState, Skeleton } from '@/components/feedback/States';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DistrictClimate } from './DistrictClimate';
import { DistrictSelect } from './DistrictSelect';
import { MONTHS, useAnomalies, useClimate, useDistricts, useRiskCalendar } from './hooks';

export function ExplorePage() {
  const [id, setId] = useState('');
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 lg:p-6">
      <PageHeader title="Climate Explorer" description="Monthly rainfall and temperature averages for a district. This is historical data, not a forecast." />
      <DistrictSelect value={id} onChange={setId} />
      {id ? <><DistrictClimate districtId={id} /><ButtonLink to={`/climate/${id}`} variant="outline">Seasonal risk calendar</ButtonLink></>
        : <EmptyState title="Choose a district" description="Pick a district above to see its climate." />}
    </div>
  );
}

export function ClimateProfilePage() {
  const { districtId = '' } = useParams();
  const nav = useNavigate();
  const risk = useRiskCalendar(districtId);
  return (
    <div className="space-y-6">
      <PageHeader title="Climate profile" action={<ButtonLink to={`/climate/${districtId}/anomalies`} variant="outline">Recent years vs average</ButtonLink>} />
      <DistrictSelect value={districtId} onChange={(v) => v && nav(`/climate/${v}`)} />
      {districtId && <DistrictClimate districtId={districtId} />}
      {districtId && (
        <section aria-labelledby="risk-h" className="space-y-3">
          <h2 id="risk-h" className="text-xl font-semibold">Seasonal risk calendar</h2>
          <QueryState query={risk} skeleton={<Skeleton className="h-48 w-full" />} isEmpty={(r) => r.months.length === 0} empty={{ title: 'No risk data yet', description: 'Not enough history to build a risk calendar for this district.' }}>
            {(r) => <><RiskCalendar months={r.months} basisYears={r.basis_years ?? undefined} /><FreshnessNote at={r.fetched_at} stale={r.stale} source={r.source} /></>}
          </QueryState>
        </section>
      )}
    </div>
  );
}

export function AnomalyPage() {
  const { districtId = '' } = useParams();
  const nav = useNavigate();
  const q = useAnomalies(districtId);
  return (
    <div className="space-y-6">
      <PageHeader title="Recent years vs average" description="How each recent year differs from the long-term average for this district." />
      <DistrictSelect value={districtId} onChange={(v) => v && nav(`/climate/${v}/anomalies`)} />
      {districtId && (
        <QueryState query={q} skeleton={<Skeleton className="h-80 w-full" />} isEmpty={(a) => a.years.length === 0} empty={{ title: 'No comparison available', description: 'There is not enough data to compare recent years.' }}>
          {(a) => (
            <div className="space-y-4">
              <Card>
                <ClimateChart title="Difference from the long-term average" xKey="year" leftUnit="%" rightUnit="°C"
                  data={a.years.map((y) => ({ year: String(y.year), rain: y.rainfall_anomaly_pct, temp: y.temp_anomaly_c }))}
                  series={[{ key: 'rain', label: 'Rainfall difference', type: 'bar', unit: '%' }, { key: 'temp', label: 'Temperature difference', type: 'line', axis: 'right', unit: '°C' }]}
                  summary="Yearly differences in rainfall (percent) and temperature (degrees) compared with the long-term average."
                  caption={a.baseline_years ? `Baseline: ${a.baseline_years}-year average. Differences are descriptive and do not by themselves show a climate trend.` : 'Differences are descriptive and do not by themselves show a climate trend.'} />
              </Card>
              <ul className="stack-grid grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {a.years.map((y) => (
                  <li key={y.year}><Card className="space-y-2"><h3 className="font-semibold">{y.year}</h3><div className="flex flex-wrap gap-1">
                    {y.temp_anomaly_c === null ? <Badge>Temperature: no data</Badge> : <Badge>{y.temp_anomaly_c > 0 ? 'Warmer' : 'Cooler'} ({y.temp_anomaly_c > 0 ? '+' : ''}{y.temp_anomaly_c.toFixed(1)} °C)</Badge>}
                    {y.rainfall_anomaly_pct === null ? <Badge>Rainfall: no data</Badge> : <Badge>{y.rainfall_anomaly_pct < 0 ? 'Drier' : 'Wetter'} ({y.rainfall_anomaly_pct > 0 ? '+' : ''}{Math.round(y.rainfall_anomaly_pct)}%)</Badge>}
                  </div></Card></li>
                ))}
              </ul>
              <FreshnessNote at={a.fetched_at} stale={a.stale} source={a.source} /><Disclaimer />
            </div>
          )}
        </QueryState>
      )}
    </div>
  );
}

export function ComparePage() {
  const { language } = useLanguage();
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [tab, setTab] = useState<'rain' | 'temp'>('rain');
  const districts = useDistricts();
  const ca = useClimate(a || undefined);
  const cb = useClimate(b || undefined);
  const ra = useRiskCalendar(a || undefined);
  const rb = useRiskCalendar(b || undefined);
  const nameOf = (id: string) => { const d = districts.data?.find((x) => x.id === id); return d ? (language === 'bn' ? d.name_bn : d.name_en) : id; };
  const ready = ca.data && cb.data && ca.data.months.length > 0 && cb.data.months.length > 0;
  const rows = (key: 'rainfall_mm' | 'temp_avg') => Array.from({ length: 12 }, (_, i) => ({
    month: MONTHS[i] as string,
    a: ca.data?.months.find((m) => m.month === i + 1)?.[key] ?? null,
    b: cb.data?.months.find((m) => m.month === i + 1)?.[key] ?? null,
  }));
  const chart = (key: 'rainfall_mm' | 'temp_avg', title: string, unit: string) => (
    <Card>
      <ClimateChart title={title} xKey="month" leftUnit={unit} data={rows(key).map((r) => ({ month: r.month, [nameOf(a)]: r.a, [nameOf(b)]: r.b }))}
        series={[{ key: nameOf(a), label: nameOf(a), type: 'line', unit }, { key: nameOf(b), label: nameOf(b), type: 'line', unit }]}
        summary={`${title} for ${nameOf(a)} and ${nameOf(b)}, over the same ${ca.data?.years ?? 20}-year period.`} />
    </Card>
  );
  return (
    <div className="space-y-6">
      <PageHeader title="Compare districts" description="Two districts on the same monthly climate averages." />
      <div className="stack-grid grid gap-4 md:grid-cols-2"><DistrictSelect label="District A" value={a} onChange={setA} /><DistrictSelect label="District B" value={b} onChange={setB} /></div>
      {a && a === b && <p role="alert" className="text-danger-text">Choose two different districts.</p>}
      {(!a || !b || a === b) ? <EmptyState title="Pick two districts" description="Select district A and district B to compare them." /> : !ready ? (
        ca.isError || cb.isError ? <EmptyState title="Comparison unavailable" description="Climate data could not be loaded for one of the districts." /> : <Skeleton className="h-80 w-full" />
      ) : (
        <>
          <div className="flex gap-2 md:hidden" role="tablist" aria-label="Metric">
            <Button variant={tab === 'rain' ? 'primary' : 'outline'} role="tab" aria-selected={tab === 'rain'} onClick={() => setTab('rain')}>Rainfall</Button>
            <Button variant={tab === 'temp' ? 'primary' : 'outline'} role="tab" aria-selected={tab === 'temp'} onClick={() => setTab('temp')}>Temperature</Button>
          </div>
          <div className="stack-grid grid gap-4 md:grid-cols-2">
            <div className={tab === 'rain' ? '' : 'hidden md:block'}>{chart('rainfall_mm', 'Rainfall', 'mm')}</div>
            <div className={tab === 'temp' ? '' : 'hidden md:block'}>{chart('temp_avg', 'Temperature', '°C')}</div>
          </div>
          {ra.data && rb.data && (
            <Card className="overflow-x-auto">
              <h2 className="mb-2 text-lg font-semibold">Risk differences (heatwave days / dry-spell %)</h2>
              <table className="w-full text-left"><thead><tr className="border-b border-subtle"><th className="py-2">Month</th><th>{nameOf(a)}</th><th>{nameOf(b)}</th></tr></thead>
                <tbody>{ra.data.months.map((m) => { const o = rb.data?.months.find((x) => x.month === m.month); return (
                  <tr key={m.month} className="border-b border-subtle"><td className="py-2">{MONTHS[m.month - 1]}</td><td>{m.heatwave_days.toFixed(1)} / {Math.round(m.dry_spell_likelihood)}%</td><td>{o ? `${o.heatwave_days.toFixed(1)} / ${Math.round(o.dry_spell_likelihood)}%` : 'no data'}</td></tr>); })}</tbody></table>
            </Card>
          )}
          <FreshnessNote at={Math.min(new Date(ca.data?.fetched_at ?? 0).getTime(), new Date(cb.data?.fetched_at ?? 0).getTime())} source={ca.data?.source} /><Disclaimer />
          <Link to={`/climate/${a}`} className="text-primary-text underline">Open {nameOf(a)} profile</Link>
        </>
      )}
    </div>
  );
}
