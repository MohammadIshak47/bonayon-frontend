import { useLanguage } from '@/app/providers/LanguageProvider';
import { FormField, Select } from '@/components/ui/FormField';
import { useDistricts } from './hooks';

interface Props { value: string; onChange: (id: string) => void; label?: string }

export function DistrictSelect({ value, onChange, label = 'District' }: Props) {
  const { language } = useLanguage();
  const q = useDistricts();
  return (
    <FormField label={label} error={q.isError && !q.data ? 'Could not load districts. Check your connection.' : undefined}>
      {(p) => (
        <Select value={value} onChange={(e) => onChange(e.target.value)} disabled={q.isPending} {...p}>
          <option value="">{q.isPending ? 'Loading districts…' : 'Select a district'}</option>
          {q.data?.map((d) => <option key={d.id} value={d.id} lang={language}>{language === 'bn' ? d.name_bn : d.name_en}</option>)}
        </Select>
      )}
    </FormField>
  );
}
