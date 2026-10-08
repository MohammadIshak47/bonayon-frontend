import { CloudRain, Droplets, Thermometer } from 'lucide-react';
import { QueryState } from '@/components/feedback/QueryState';
import { Skeleton } from '@/components/feedback/States';
import { ClimateChart } from '@/components/domain/ClimateChart';
import { Disclaimer, FreshnessNote } from '@/components/domain/Freshness';
import { StatCard } from '@/components/ui/Card';
import { MONTHS, useClimate } from './hooks';

/** Public climate profile: charts + stats derived only from the returned monthly averages. */
export function DistrictClimate({ districtId }: { districtId: string }) {
  const q = useClimate(districtId);
  return (
    <QueryState query={q} skeleton={<div className="space-y-3"><Skeleton className="h-24 w-full" /><Skeleton className="h-80 w-full" /></div>}
      isEmpty={(c) => c.months.length === 0} empty={{ title: 'Not enough climate data', description: 'The service has no usable data for this district yet. Try again later.' }}>
      {(c) => {
        const rain = c.months.filter((m) => m.rainfall_mm !== null);
        const temp = c.months.filter((m) => m.temp_avg !== null);
        const total = rain.reduce((a, m) => a + (m.rainfall_mm ?? 0), 0);
        const wettest = rain.reduce<typeof rain[number] | undefined>((b, m) => (!b || (m.rainfall_mm ?? 0) > (b.rainfall_mm ?? 0) ? m : b), undefined);
        const hottest = temp.reduce<typeof temp[number] | undefined>((b, m) => (!b || (m.temp_avg ?? 0) > (b.temp_avg ?? 0) ? m : b), undefined);
        const name = (m?: { month: number }) => (m ? (MONTHS[m.month - 1] ?? String(m.month)) : '—');
        const data = c.months.map((m) => ({ month: MONTHS[m.month - 1] ?? String(m.month), rain: m.rainfall_mm, temp: m.temp_avg }));
        return (
          <div className="space-y-4">
            <div className="stack-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard label="Yearly rainfall" value={rain.length ? `${Math.round(total)} mm` : '—'} hint={rain.length < 12 ? `Sum of ${rain.length} months with data` : `Average over ${c.years} years`} icon={<CloudRain size={22} aria-hidden="true" />} />
              <StatCard label="Wettest month" value={name(wettest)} hint={wettest?.rainfall_mm != null ? `${Math.round(wettest.rainfall_mm)} mm` : undefined} icon={<Droplets size={22} aria-hidden="true" />} />
              <StatCard label="Hottest month" value={name(hottest)} hint={hottest?.temp_avg != null ? `${hottest.temp_avg.toFixed(1)} °C average` : undefined} icon={<Thermometer size={22} aria-hidden="true" />} />
            </div>
            <ClimateChart title="Monthly rainfall and temperature" xKey="month" data={data} leftUnit="mm" rightUnit="°C"
              series={[{ key: 'rain', label: 'Rainfall', type: 'bar', unit: 'mm' }, { key: 'temp', label: 'Temperature', type: 'line', axis: 'right', unit: '°C' }]}
              summary={`Average monthly rainfall and temperature over ${c.years} years.`}
              caption={c.data_span ? `Data from ${c.data_span.start} to ${c.data_span.end}. Historical averages, not a forecast.` : 'Historical averages, not a forecast.'} />
            <FreshnessNote at={c.fetched_at} stale={c.stale} source={c.source} />
            <Disclaimer />
          </div>
        );
      }}
    </QueryState>
  );
}
