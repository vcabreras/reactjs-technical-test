import { Link, useLocation } from 'react-router';
import type { User } from '@/api/schemas';

/** Enlace al detalle conservando los params del listado para poder volver al mismo estado. */
export function UserNameLink({ user }: { user: User }) {
  const { search } = useLocation();

  return (
    <Link
      to={{ pathname: `/users/${user.id}`, search }}
      className="fw-semibold text-decoration-none"
      // La fila también navega al hacer click: evitar la doble navegación.
      onClick={(event) => event.stopPropagation()}
    >
      {user.name}
    </Link>
  );
}
