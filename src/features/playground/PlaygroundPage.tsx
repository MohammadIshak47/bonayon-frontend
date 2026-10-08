import { useState } from 'react';
import { AdvisoryCard } from '@/components/domain/AdvisoryCard';
import { ClimateChart } from '@/components/domain/ClimateChart';
import { EmptyState, ErrorState, Skeleton, Spinner } from '@/components/feedback/States';
import { Badge, HazardBadge, RiskBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { CropMatchBar } from '@/components/ui/CropMatchBar';
import { FormField, Input, Select } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/app/providers/ToastProvider';

const S = ({ t, children }: { t: string; children: React.ReactNode }) => <section className="mb-8"><h2 className="mb-3 text-xl font-semibold">{t}</h2>{children}</section>;
// Placeholder values for visual review ONLY. Not real data.
const DEMO = ['Jan', 'Feb', 'Mar', 'Apr'].map((m, i) => ({ m, rain: [10, 30, 60, 120][i] ?? null, temp: [18, 21, 26, 29][i] ?? null }));

export function PlaygroundPage() {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  return (
    <div className="mx-auto max-w-5xl p-4 lg:p-6">
      <h1 className="mb-1 text-3xl font-semibold">Component playground</h1>
      <p className="mb-6 text-muted">Dev-only route (removed from production builds). Toggle theme and Farmer mode in the header. All values are placeholders.</p>
      <S t="Buttons"><div className="flex flex-wrap gap-3"><Button>Primary</Button><Button variant="outline">Outline</Button><Button variant="ghost">Ghost</Button><Button variant="danger">Danger</Button><Button loading>Loading</Button><Button disabled>Disabled</Button></div></S>
      <S t="Badges"><div className="flex flex-wrap gap-2"><Badge>Neutral</Badge><RiskBadge level="low" /><RiskBadge level="moderate" /><RiskBadge level="high" /><HazardBadge kind="heatwave" /><HazardBadge kind="dryspell" /><HazardBadge kind="flood" /><HazardBadge kind="none" /></div></S>
      <S t="Cards"><div className="stack-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><StatCard label="Label" value="123" hint="Placeholder" /><StatCard label="Empty" value="—" /><Card>Plain card</Card></div></S>
      <S t="Form fields"><div className="stack-grid grid gap-4 md:grid-cols-2"><FormField label="Text" hint="Helpful hint">{(p) => <Input {...p} />}</FormField><FormField label="Select" error="Please choose one">{(p) => <Select {...p}><option>One</option></Select>}</FormField></div></S>
      <S t="CropMatchBar tiers"><Card className="space-y-4"><CropMatchBar cropName="High" score={80} scale={{ min: 0, max: 100 }} tierLabel="Excellent" /><CropMatchBar cropName="Mid" score={45} scale={{ min: 0, max: 100 }} tierLabel="Marginal" /><CropMatchBar cropName="Low" score={20} scale={{ min: 0, max: 100 }} tierLabel="Poor" /></Card></S>
      <S t="AdvisoryCard"><AdvisoryCard title="Sample advisory" what="Placeholder action" when="Placeholder timing" why="Placeholder reasoning" warning="Placeholder warning" riskLevel="moderate" generatedAt={new Date().toISOString()} /></S>
      <S t="ClimateChart"><Card><ClimateChart title="Demo chart" xKey="m" data={DEMO} leftUnit="mm" rightUnit="°C" summary="Placeholder chart for styling." series={[{ key: 'rain', label: 'Rainfall', type: 'bar', unit: 'mm' }, { key: 'temp', label: 'Temperature', type: 'line', axis: 'right', unit: '°C' }]} /></Card></S>
      <S t="States"><div className="stack-grid grid gap-4 md:grid-cols-2"><div className="space-y-2"><Spinner /><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-2/3" /></div><EmptyState title="Empty" description="Explains the next step." /><ErrorState message="Cannot reach the server." onRetry={() => undefined} /></div></S>
      <S t="Toast and modal"><div className="flex gap-3"><Button variant="outline" onClick={() => toast.success('Saved')}>Success toast</Button><Button variant="outline" onClick={() => toast.error('Something failed')}>Error toast</Button><Button onClick={() => setOpen(true)}>Open modal</Button></div>
        <Modal open={open} onClose={() => setOpen(false)} title="Modal"><Button onClick={() => setOpen(false)}>Close</Button></Modal></S>
    </div>
  );
}
