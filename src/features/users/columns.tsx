import type { User } from '@/api/schemas';
import { createDataTableColumnHelper } from '@/components/ui';
import { UserNameLink } from './UserNameLink';

const helper = createDataTableColumnHelper<User>();

/** Columnas a nivel de módulo: referencia estable para TanStack Table. */
export const userColumns = helper.columns([
  helper.accessor('name', {
    header: 'Nombre',
    cell: ({ row }) => <UserNameLink user={row.original} />,
    meta: { cardTitle: true },
  }),
  helper.accessor('username', {
    header: 'Usuario',
    cell: ({ getValue }) => `@${getValue()}`,
  }),
  helper.accessor('email', {
    header: 'Email',
    // Visible en cards (móvil) y desde lg; oculta en la tabla de tablet por espacio.
    meta: { className: 'd-md-none d-lg-table-cell text-break' },
  }),
  helper.accessor((user) => user.address.city, {
    id: 'city',
    header: 'Ciudad',
    enableSorting: false,
    meta: { className: 'd-md-none d-xl-table-cell' },
  }),
]);
