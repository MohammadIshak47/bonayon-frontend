import { Outlet } from 'react-router-dom';
import { Logo } from './Logo';

export function AuthLayout() {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="rounded-panel border border-subtle bg-surface p-6 shadow-card"><Outlet /></div>
      </div>
    </div>
  );
}
