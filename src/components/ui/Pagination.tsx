import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface Props { page: number; size: number; total: number; onPage: (p: number) => void }

export function Pagination({ page, size, total, onPage }: Props) {
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3">
      <Button variant="outline" disabled={page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft size={18} aria-hidden="true" />Previous</Button>
      <span className="text-muted" aria-live="polite">Page {page} of {pages}</span>
      <Button variant="outline" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next<ChevronRight size={18} aria-hidden="true" /></Button>
    </nav>
  );
}
