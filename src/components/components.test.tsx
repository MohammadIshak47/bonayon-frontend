// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UseQueryResult } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PreferencesProvider, usePreferences } from '@/app/providers/PreferencesProvider';
import { QueryState } from '@/components/feedback/QueryState';
import { ErrorState } from '@/components/feedback/States';
import { RiskBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CropMatchBar } from '@/components/ui/CropMatchBar';

afterEach(cleanup);

describe('Button', () => {
  it('is disabled and busy while loading', () => {
    render(<Button loading>Save</Button>);
    const b = screen.getByRole('button', { name: 'Save' });
    expect(b).toBeDisabled();
    expect(b).toHaveAttribute('aria-busy', 'true');
  });
});

describe('RiskBadge', () => {
  it('always shows text, not colour alone', () => {
    render(<><RiskBadge level="low" /><RiskBadge level="high" /></>);
    expect(screen.getByText('Low risk')).toBeInTheDocument();
    expect(screen.getByText('High risk')).toBeInTheDocument();
  });
});

describe('CropMatchBar', () => {
  it('exposes the score as a meter using the supplied scale', () => {
    render(<CropMatchBar cropName="Wheat" score={62} scale={{ min: 0, max: 100 }} tierLabel="Good" />);
    const m = screen.getByRole('meter', { name: 'Wheat match' });
    expect(m).toHaveAttribute('aria-valuenow', '62');
    expect(m).toHaveAttribute('aria-valuemax', '100');
    expect(screen.getByText('Good')).toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it('calls retry when the button is pressed', async () => {
    const retry = vi.fn();
    render(<ErrorState message="Cannot reach the server." onRetry={retry} />);
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(retry).toHaveBeenCalledOnce();
  });
});

describe('QueryState', () => {
  const q = (o: object) => o as unknown as UseQueryResult<string[], unknown>;
  const view = (query: UseQueryResult<string[], unknown>) => render(
    <QueryState query={query} skeleton={<p>loading…</p>} isEmpty={(d) => d.length === 0} empty={{ title: 'Nothing here' }}>{(d) => <p>{d.join(',')}</p>}</QueryState>,
  );
  it('shows the skeleton while pending', () => { view(q({ isPending: true })); expect(screen.getByText('loading…')).toBeInTheDocument(); });
  it('shows an error with retry when there is no data', () => { view(q({ isPending: false, isError: true, error: { message: 'boom' }, data: undefined, refetch: vi.fn() })); expect(screen.getByRole('alert')).toBeInTheDocument(); });
  it('shows the empty state', () => { view(q({ isPending: false, isError: false, data: [] })); expect(screen.getByText('Nothing here')).toBeInTheDocument(); });
  it('keeps showing old data when a refetch fails', () => { view(q({ isPending: false, isError: true, error: { message: 'x' }, data: ['a'], isFetching: false })); expect(screen.getByText('a')).toBeInTheDocument(); });
});

describe('Farmer mode preference', () => {
  beforeEach(() => {
    localStorage.clear();
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }) as unknown as typeof window.matchMedia;
  });
  function Probe() { const { farmerMode, setFarmerMode } = usePreferences(); return <button onClick={() => setFarmerMode(!farmerMode)}>toggle</button>; }
  it('sets data-farmer on <html> and persists it', async () => {
    render(<PreferencesProvider><Probe /></PreferencesProvider>);
    await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(document.documentElement.getAttribute('data-farmer')).toBe('on');
    expect(localStorage.getItem('bonayon:farmer')).toBe('on');
  });
});
