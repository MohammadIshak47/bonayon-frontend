import { CalendarDays, Layers, Lightbulb, Sprout } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { AdvisoryCard } from '@/components/domain/AdvisoryCard';
import { QueryState } from '@/components/feedback/QueryState';
import { Skeleton } from '@/components/feedback/States';
import { PageHeader } from '@/components/layout/PageHeader';
import { ButtonLink } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { advisoryFromRecommendation } from '@/features/recommend/advisory';
import { useDashboard } from '@/features/recommend/hooks';

export function DashboardPage() {
  const { user } = useAuth();
  const q = useDashboard();
  return (
    <div className="space-y-6">
      <PageHeader title={`Hello${user ? `, ${user.name}` : ''}`} description="Your farm command center." />
      <QueryState query={q} skeleton={<div className="stack-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div>}>
        {(d) => {
          const latest = d.latest_recommendation;
          return (
            <div className="space-y-6">
              <div className="stack-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Farms" value={d.farms_count} icon={<Sprout size={24} aria-hidden="true" />} />
                <StatCard label="Plots" value={d.plots_count} icon={<Layers size={24} aria-hidden="true" />} />
                <StatCard label="Season plans" value={d.plans_count} icon={<CalendarDays size={24} aria-hidden="true" />} />
                <StatCard label="Latest advice" value={latest ? (latest.type === 'season_plan' ? 'Season plan' : 'Crop match') : 'None yet'} hint={latest ? new Date(latest.created_at).toLocaleDateString() : undefined} icon={<Lightbulb size={24} aria-hidden="true" />} />
              </div>
              {d.farms_count === 0 && <Card className="space-y-2"><h2 className="text-lg font-semibold">Start with your first farm</h2><p className="text-muted">Add a farm and plots to get advice tailored to your land.</p><ButtonLink to="/farms">Add a farm</ButtonLink></Card>}
              {latest ? (() => { const a = advisoryFromRecommendation(latest); return <AdvisoryCard {...a} />; })()
                : <Card className="space-y-2"><h2 className="text-lg font-semibold">No advice yet</h2><p className="text-muted">Find crops that suit your district, soil and season.</p><ButtonLink to="/crop-recommendation">Find suitable crops</ButtonLink></Card>}
              <section aria-labelledby="recent-h"><h2 id="recent-h" className="mb-2 text-xl font-semibold">Recent recommendations</h2>
                {d.recent_recommendations.length === 0 ? <p className="text-muted">Nothing here yet.</p> : (
                  <ul className="space-y-2">{d.recent_recommendations.map((r) => <li key={r.id}><Card className="flex flex-wrap justify-between gap-2"><span className="font-semibold">{r.type === 'season_plan' ? 'Season plan' : 'Crop suitability'} · {r.season}</span><span className="text-muted">{new Date(r.created_at).toLocaleDateString()}</span></Card></li>)}</ul>
                )}
              </section>
              <div className="flex flex-wrap gap-3"><ButtonLink to="/crop-recommendation">Find suitable crops</ButtonLink><ButtonLink to="/season-plan" variant="outline">Season plan</ButtonLink><ButtonLink to="/explore" variant="outline">Explore climate</ButtonLink></div>
            </div>
          );
        }}
      </QueryState>
    </div>
  );
}
