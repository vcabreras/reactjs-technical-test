import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/api/errors';
import { createPost, getPostsByUser } from '@/api/posts';
import type { PostInput } from '@/api/schemas';
import { notify } from '@/components/ui';

export const postKeys = {
  all: ['posts'] as const,
  byUser: (userId: number) => [...postKeys.all, 'byUser', userId] as const,
};

/**
 * Posts de un usuario. JSONPlaceholder no persiste lo creado, así que la caché es la fuente de
 * verdad durante la sesión: nunca se considera obsoleta ni se descarta (un refetch borraría
 * los posts creados).
 */
export function postsByUserQueryOptions(userId: number) {
  return queryOptions({
    queryKey: postKeys.byUser(userId),
    queryFn: ({ signal }) => getPostsByUser(userId, signal),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

const CREATE_POST_ERROR_TOAST_ID = 'create-post-error';

/**
 * Crea un post y lo inserta al principio de la caché con `setQueryData`.
 * Prohibido invalidar/refetch: el servidor no lo devolvería y desaparecería de la lista.
 */
export function useCreatePost(userId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PostInput) => createPost({ ...input, userId }),
    onSuccess: (post) => {
      queryClient.setQueryData(postsByUserQueryOptions(userId).queryKey, (posts) =>
        // Sin lista cargada no se inserta (se perderían los posts del servidor); el formulario
        // solo se muestra cuando la lista ya está en caché.
        posts ? [post, ...posts] : posts,
      );
      notify.dismiss(CREATE_POST_ERROR_TOAST_ID);
      notify.success('Publicación creada', {
        description: 'Aparece en la lista (la API de pruebas no la guarda).',
      });
    },
    onError: (error) => {
      notify.error('No se pudo crear la publicación', {
        id: CREATE_POST_ERROR_TOAST_ID,
        description: getErrorMessage(error),
      });
    },
  });
}
