import { CalendarRange, CloudSun, ShieldAlert, Sprout, Wheat } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DistrictClimate } from '@/features/climate/DistrictClimate';
import { DistrictSelect } from '@/features/climate/DistrictSelect';

export function LandingPage() {
  const [id, setId] = useState('');
  const { t } = useLanguage();
  const features = [
    { icon: Wheat, title: t('landing.cropTitle'), text: t('landing.cropText') },
    { icon: CalendarRange, title: t('landing.planTitle'), text: t('landing.planText') },
    { icon: ShieldAlert, title: t('landing.riskTitle'), text: t('landing.riskText') },
  ];
  return (
    <>
      <section className="relative overflow-hidden border-b border-subtle bg-gradient-to-b from-primary/20 via-primary/5 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:py-24">
          <p className="mb-3 inline-flex items-center gap-2 rounded-control border border-subtle bg-surface px-3 py-1 text-sm text-primary-text"><Sprout size={16} aria-hidden="true" />Bonayon · <span lang="bn">বনায়ন</span></p>
          <h1 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">{t('landing.heroTitle')}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">{t('landing.heroText')}</p>
          <div className="mt-6 flex flex-wrap gap-3"><ButtonLink to="/explore">{t('landing.exploreCta')}</ButtonLink><ButtonLink to="/register" variant="outline">{t('landing.startCta')}</ButtonLink></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="problem-h">
        <h2 id="problem-h" className="mb-2 text-2xl font-semibold">{t('landing.problemTitle')}</h2>
        <p className="max-w-3xl text-muted">{t('landing.problemText')}</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12" aria-label="Features">
        <ul className="stack-grid grid gap-4 md:grid-cols-3">{features.map(({ icon: Icon, title, text }) => (
          <li key={title}><Card className="h-full"><Icon className="mb-3 text-primary-text" size={28} aria-hidden="true" /><h3 className="font-semibold">{title}</h3><p className="mt-1 text-muted">{text}</p></Card></li>
        ))}</ul>
      </section>

      <section className="border-t border-subtle bg-surface" aria-labelledby="try-h">
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-12">
          <h2 id="try-h" className="flex items-center gap-2 text-2xl font-semibold"><CloudSun aria-hidden="true" />{t('landing.tryTitle')}</h2>
          <div className="max-w-sm"><DistrictSelect value={id} onChange={setId} /></div>
          {id && <DistrictClimate districtId={id} />}
        </div>
      </section>
    </>
  );
}
