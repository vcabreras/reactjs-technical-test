import { USER_SORT_FIELDS, type UserSortField } from '@/api/users';
import type { ListSearchParamsConfig } from '@/hooks/useListSearchParams';

export const USERS_LIST_CONFIG: ListSearchParamsConfig<UserSortField> = {
  sortFields: USER_SORT_FIELDS,
  defaultSort: 'name',
  defaultOrder: 'asc',
  pageSizes: [5, 10],
  defaultPageSize: 5,
};

export function isUserSortField(value: string): value is UserSortField {
  return (USER_SORT_FIELDS as readonly string[]).includes(value);
}
