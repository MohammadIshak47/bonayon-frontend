import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

interface Props { open: boolean; onClose: () => void; title: string; children: ReactNode }

/** Native <dialog>: focus trap, ESC and inert backdrop come from the browser. */
export function Modal({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className="w-[min(32rem,calc(100vw-2rem))] rounded-panel border border-subtle bg-raised p-0 text-text shadow-xl backdrop:bg-black/50"
    >
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-xl font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid min-h-tap min-w-tap place-items-center rounded-control hover:bg-surface"><X size={20} aria-hidden="true" /></button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
