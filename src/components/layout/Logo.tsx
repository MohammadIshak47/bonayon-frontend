import { Link } from 'react-router-dom';

export function Logo() {
  return (
    <Link to="/" className="flex min-h-tap items-center gap-2 font-semibold text-primary-text">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <path d="M14 26V12M14 12C14 6 9 3 3 3c0 6 4 9 11 9Zm0 4c0-5 4-8 11-8 0 6-4 9-11 8Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>Bonayon <span lang="bn" className="font-normal text-muted">বনায়ন</span></span>
    </Link>
  );
}
