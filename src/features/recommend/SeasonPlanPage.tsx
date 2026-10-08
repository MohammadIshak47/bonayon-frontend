import { zodResolver } from '@hookform/resolvers/zod';
import { useQueries } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/app/providers/ToastProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField, Input, Select } from '@/components/ui/FormField';
import { DistrictSelect } from '@/features/climate/DistrictSelect';
import { useFarms, plotsQuery } from '@/features/farms/hooks';
import { SOIL_TYPES, type Recommendation } from '@/types/api';
import { CropResults } from './CropResults';
import { seasonsOf, useCrops, useInputEstimate, useSeasonPlan } from './hooks';
import { soilLabel } from './CropWizardPage';

const rawSchema = z.object({ district_id: z.string().min(1, 'Choose a district'), soil_type: z.enum(SOIL_TYPES, { message: 'Choose a soil type' }), season: z.string().min(1, 'Choose a season') });
type Raw = z.infer<typeof rawSchema>;

function InputEstimator() {
  const crops = useCrops();
  const est = useInputEstimate();
  const [cropId, setCropId] = useState('');
  const [area, setArea] = useState('');
  const valid = cropId && Number(area) > 0;
  return (
    <Card className="space-y-3">
      <h2 className="text-lg font-semibold">Seed and fertilizer estimate</h2>
      <div className="stack-grid grid gap-3 md:grid-cols-2">
        <FormField label="Crop">{(p) => <Select value={cropId} onChange={(e) => setCropId(e.target.value)} {...p}><option value="">Select…</option>{crops.data?.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}</Select>}</FormField>
        <FormField label="Area (decimal)">{(p) => <Input type="number" inputMode="decimal" min="0" step="any" value={area} onChange={(e) => setArea(e.target.value)} {...p} />}</FormField>
      </div>
      <Button disabled={!valid} loading={est.isPending} onClick={() => est.mutate({ crop_id: cropId, area_decimal: Number(area) })}>Estimate</Button>
      {est.isError && <p role="alert" className="text-danger-text">{est.error.message}</p>}
      {est.data && <div className="text-muted"><p>Seed needed: about <strong className="text-text">{est.data.seed_kg} kg</strong></p>{est.data.npk_note && <p>{est.data.npk_note}</p>}<p className="text-sm">{est.data.label ?? 'Estimate only: verify locally with your agriculture officer.'}</p></div>}
    </Card>
  );
}

export function SeasonPlanPage() {
  const toast = useToast();
  const crops = useCrops();
  const farms = useFarms(1, 50);
  const plots = useQueries({ queries: (farms.data?.items ?? []).map((fm) => plotsQuery(fm.id)) });
  const allPlots = plots.flatMap((q) => q.data ?? []);
  const plan = useSeasonPlan();
  const [mode, setMode] = useState<'plot' | 'raw'>('plot');
  const [plotId, setPlotId] = useState('');
  const [result, setResult] = useState<Recommendation | null>(null);
  const f = useForm<Raw>({ resolver: zodResolver(rawSchema), defaultValues: { district_id: '', season: '' } });
  const district = useWatch({ control: f.control, name: 'district_id' });
  const e = f.formState.errors;
  const done = { onSuccess: setResult, onError: (err: { message: string }) => toast.error(err.message) };

  return (
    <div className="space-y-6">
      <PageHeader title="Season plan" description="Get a planting plan for one of your plots, or enter the details yourself." />
      <Card className="space-y-4">
        <div className="flex gap-2" role="group" aria-label="Input type">
          <Button variant={mode === 'plot' ? 'primary' : 'outline'} aria-pressed={mode === 'plot'} onClick={() => setMode('plot')}>My plot</Button>
          <Button variant={mode === 'raw' ? 'primary' : 'outline'} aria-pressed={mode === 'raw'} onClick={() => setMode('raw')}>Enter details</Button>
        </div>
        {mode === 'plot' ? (
          <>
            <FormField label="Plot" hint={allPlots.length === 0 && !farms.isPending ? 'You have no plots yet. Add one from Farms, or enter details instead.' : undefined}>
              {(p) => <Select value={plotId} onChange={(ev) => setPlotId(ev.target.value)} {...p}><option value="">Select a plot…</option>{allPlots.map((pl) => <option key={pl.id} value={pl.id}>{pl.name} ({pl.area_decimal} decimal)</option>)}</Select>}
            </FormField>
            <Button disabled={!plotId} loading={plan.isPending} onClick={() => plan.mutate({ plot_id: plotId }, done)}>Get plan</Button>
          </>
        ) : (
          <form onSubmit={f.handleSubmit((v) => plan.mutate(v, done))} className="space-y-4" noValidate>
            <DistrictSelect value={district} onChange={(v) => f.setValue('district_id', v, { shouldValidate: true })} />
            {e.district_id && <p role="alert" className="text-danger-text">{e.district_id.message}</p>}
            <div className="stack-grid grid gap-4 md:grid-cols-2">
              <FormField label="Soil type" error={e.soil_type?.message}>{(p) => <Select defaultValue="" {...p} {...f.register('soil_type')}><option value="" disabled>Select…</option>{SOIL_TYPES.map((s) => <option key={s} value={s}>{soilLabel(s)}</option>)}</Select>}</FormField>
              <FormField label="Season" error={e.season?.message}>{(p) => <Select defaultValue="" {...p} {...f.register('season')}><option value="" disabled>Select…</option>{seasonsOf(crops.data).map((s) => <option key={s}>{s}</option>)}</Select>}</FormField>
            </div>
            <Button type="submit" loading={plan.isPending}>Get plan</Button>
          </form>
        )}
      </Card>
      {result && <CropResults rec={result} />}
      <InputEstimator />
    </div>
  );
}
