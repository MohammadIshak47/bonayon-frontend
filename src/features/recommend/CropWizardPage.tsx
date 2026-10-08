import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/app/providers/ToastProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField, Select } from '@/components/ui/FormField';
import { DistrictSelect } from '@/features/climate/DistrictSelect';
import { SOIL_TYPES, type Recommendation, type SoilType } from '@/types/api';
import { CropResults } from './CropResults';
import { seasonsOf, useCropChoice, useCrops } from './hooks';

const schema = z.object({ district_id: z.string().min(1, 'Choose a district'), soil_type: z.enum(SOIL_TYPES, { message: 'Choose a soil type' }), season: z.string().min(1, 'Choose a season') });
type Values = z.infer<typeof schema>;
const STEPS = [['district_id', 'District'], ['soil_type', 'Soil'], ['season', 'Season']] as const;
export const soilLabel = (s: SoilType) => s.replace('_', ' ');

export function CropWizardPage() {
  const toast = useToast();
  const crops = useCrops();
  const run = useCropChoice();
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<Recommendation | null>(null);
  const f = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { district_id: '', season: '' } });
  const district = useWatch({ control: f.control, name: 'district_id' });
  const e = f.formState.errors;
  const [key] = STEPS[step] as (typeof STEPS)[number];

  const next = async () => {
    if (!(await f.trigger(key))) return;
    if (step < 2) return setStep(step + 1);
    run.mutate(f.getValues(), { onSuccess: setResult, onError: (err) => toast.error(err.message) });
  };

  if (result) {
    return (
      <div className="space-y-6"><PageHeader title="Crop suitability results" />
        <CropResults rec={result} />
        <Button variant="outline" onClick={() => { setResult(null); setStep(0); f.reset(); }}>Start over</Button>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader title="Crop suitability" description="Answer three questions to see which crops fit best." />
      <ol className="flex gap-2" aria-label="Progress">
        {STEPS.map(([k, label], i) => <li key={k} aria-current={i === step ? 'step' : undefined} className={`flex-1 rounded-control border px-2 py-2 text-center text-sm ${i === step ? 'border-primary font-semibold' : 'border-subtle text-muted'}`}>{i + 1}. {label}</li>)}
      </ol>
      <Card className="space-y-4">
        {step === 0 && <DistrictSelect value={district} onChange={(v) => f.setValue('district_id', v, { shouldValidate: true })} />}
        {step === 0 && e.district_id && <p role="alert" className="text-danger-text">{e.district_id.message}</p>}
        {step === 1 && <FormField label="Soil type" error={e.soil_type?.message}>{(p) => <Select defaultValue="" {...p} {...f.register('soil_type')}><option value="" disabled>Select…</option>{SOIL_TYPES.map((s) => <option key={s} value={s}>{soilLabel(s)}</option>)}</Select>}</FormField>}
        {step === 2 && <FormField label="Season" hint={crops.isPending ? 'Loading seasons…' : undefined} error={e.season?.message ?? (crops.isError ? 'Could not load seasons.' : undefined)}>{(p) => <Select defaultValue="" disabled={crops.isPending} {...p} {...f.register('season')}><option value="" disabled>Select…</option>{seasonsOf(crops.data).map((s) => <option key={s}>{s}</option>)}</Select>}</FormField>}
        <div className="flex justify-between gap-3">
          <Button variant="outline" disabled={step === 0 || run.isPending} onClick={() => setStep(step - 1)}>Back</Button>
          <Button onClick={() => void next()} loading={run.isPending}>{step === 2 ? 'Get results' : 'Next'}</Button>
        </div>
      </Card>
    </div>
  );
}
