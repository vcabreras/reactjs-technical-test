import { SearchX } from 'lucide-react';
import { Link } from 'react-router';
import { EmptyState } from '@/components/ui';

export function NotFoundPage() {
  return (
    <>
      <title>Página no encontrada · Usuarios</title>
      <EmptyState
        icon={<SearchX size={40} strokeWidth={1.5} />}
        title="Página no encontrada"
        description="La dirección no existe o ha cambiado."
        action={
          <Link to="/users" className="btn btn-primary">
            Ir a usuarios
          </Link>
        }
      />
    </>
  );
}
