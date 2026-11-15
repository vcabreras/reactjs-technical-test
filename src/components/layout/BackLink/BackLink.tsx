import { ArrowLeft } from 'lucide-react';
import { Link, type To } from 'react-router';
import { cx } from '@/lib/cx';

export interface BackLinkProps {
  to: To;
  label?: string;
  /** Por defecto solo se ve por debajo de `lg` (en escritorio ambos paneles están visibles). */
  mobileOnly?: boolean;
  className?: string;
}

export function BackLink({ to, label = 'Volver', mobileOnly = true, className }: BackLinkProps) {
  return (
    <Link
      to={to}
      className={cx(
        'd-inline-flex align-items-center gap-1 mb-3 link-secondary text-decoration-none',
        mobileOnly && 'd-lg-none',
        className,
      )}
    >
      <ArrowLeft size={16} />
      {label}
    </Link>
  );
}
