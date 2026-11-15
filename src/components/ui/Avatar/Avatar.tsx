import { cx } from '@/lib/cx';
import { getInitials } from './getInitials';

export interface AvatarProps {
  /** Nombre del que se obtienen las iniciales. */
  name: string;
  className?: string;
}

/** Avatar circular con iniciales. Decorativo: el nombre ya aparece junto a él. */
export function Avatar({ name, className }: AvatarProps) {
  return (
    <span aria-hidden="true" className={cx('avatar', className)}>
      {getInitials(name)}
    </span>
  );
}
