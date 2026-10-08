import { Button } from './Button';
import { Modal } from './Modal';

interface Props { open: boolean; title: string; message: string; confirmLabel?: string; loading?: boolean; onConfirm: () => void; onCancel: () => void }

export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', loading, onConfirm, onCancel }: Props) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="mb-4 text-muted">{message}</p>
      <div className="flex justify-end gap-2"><Button variant="outline" onClick={onCancel}>Cancel</Button><Button variant="danger" loading={loading} onClick={onConfirm}>{confirmLabel}</Button></div>
    </Modal>
  );
}
