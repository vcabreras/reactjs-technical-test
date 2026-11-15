import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { z } from 'zod';
import { getErrorMessage, isApiError } from '@/api/errors';
import type { PostInput } from '@/api/schemas';
import { BackLink, PageHeader } from '@/components/layout';
import {
  Button,
  Drawer,
  EmptyState,
  ErrorState,
  Pagination,
  Skeleton,
  SkeletonGroup,
} from '@/components/ui';
import { userDetailQueryOptions } from '@/features/users/queries';
import { PostForm } from './PostForm';
import { PostList, PostListSkeleton } from './PostList';
import { postsByUserQueryOptions, useCreatePost } from './queries';

const UserIdSchema = z.coerce.number().int().positive();

/**
 * Paginación de posts en cliente: excepción documentada a la regla de paginar en servidor.
 * La API no persiste los posts creados, que solo existen en la caché; paginar en cliente la
 * lista completa (servidor + creados) mantiene total y páginas coherentes.
 */
const POSTS_PAGE_SIZE = 5;

/** Ruta `/users/:userId`: valida el param y delega en el contenido del usuario. */
export function UserPostsPanel() {
  const { userId } = useParams();
  const parsed = UserIdSchema.safeParse(userId);

  if (!parsed.success) {
    return <UserNotFound />;
  }

  // `key`: al cambiar de usuario se reinicia el estado local (página, panel abierto).
  return <UserPosts key={parsed.data} userId={parsed.data} />;
}

function useBackToListLink() {
  const { search } = useLocation();
  return { pathname: '/users', search };
}

function UserNotFound() {
  const backTo = useBackToListLink();

  return (
    <>
      <title>Usuario no encontrado · Usuarios</title>
      <BackLink to={backTo} label="Volver a usuarios" />
      <div className="card shadow-sm">
        <EmptyState
          title="Usuario no encontrado"
          description="El usuario no existe o la dirección no es correcta."
          action={
            <Link to={backTo} className="btn btn-outline-primary">
              Ver la lista de usuarios
            </Link>
          }
        />
      </div>
    </>
  );
}

function UserPosts({ userId }: { userId: number }) {
  const backTo = useBackToListLink();
  const postsHeadingId = useId();
  const postsHeadingRef = useRef<HTMLHeadingElement>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [page, setPage] = useState(1);

  // En paralelo: el detalle no depende del listado (deep link / usuario fuera de la página).
  const userQuery = useQuery(userDetailQueryOptions(userId));
  const postsQuery = useQuery(postsByUserQueryOptions(userId));
  const createPost = useCreatePost(userId);

  if (userQuery.isError && isApiError(userQuery.error) && userQuery.error.isNotFound) {
    return <UserNotFound />;
  }

  if (userQuery.isError) {
    return (
      <>
        <BackLink to={backTo} label="Volver a usuarios" />
        <ErrorState
          title="No se pudo cargar el usuario"
          message={getErrorMessage(userQuery.error)}
          onRetry={() => void userQuery.refetch()}
          isRetrying={userQuery.isFetching}
        />
      </>
    );
  }

  if (userQuery.isPending) {
    return (
      <SkeletonGroup label="Cargando usuario…">
        <Skeleton width={6} size="lg" className="mb-2" />
        <Skeleton width={4} size="sm" className="mb-4" />
        <PostListSkeleton />
      </SkeletonGroup>
    );
  }

  const user = userQuery.data;
  const posts = postsQuery.data ?? [];
  const pageCount = Math.max(1, Math.ceil(posts.length / POSTS_PAGE_SIZE));
  // Acotada sin estado extra por si la lista encoge.
  const currentPage = Math.min(page, pageCount);
  const visiblePosts = posts.slice(
    (currentPage - 1) * POSTS_PAGE_SIZE,
    currentPage * POSTS_PAGE_SIZE,
  );

  const changePage = (nextPage: number) => {
    setPage(nextPage);
    // En móvil hace scroll la página: llevar la vista al inicio de la lista (no-op si ya se ve).
    postsHeadingRef.current?.scrollIntoView({ block: 'nearest' });
  };

  const handleCreate = async (values: PostInput): Promise<boolean> => {
    try {
      await createPost.mutateAsync(values);
      setIsFormOpen(false);
      // El post nuevo va el primero: mostrar la página donde aparece.
      setPage(1);
      return true;
    } catch {
      // El error ya se notifica en `useCreatePost` (onError); el formulario conserva los valores.
      return false;
    }
  };

  const createdPostId =
    createPost.isSuccess && createPost.data.userId === userId ? createPost.data.id : undefined;

  return (
    <div className="fill-panel">
      <title>{`${user.name} · Usuarios`}</title>
      <BackLink to={backTo} label="Volver a usuarios" />
      <div className="card border-0 shadow-sm mb-4 flex-shrink-0">
        <div className="card-body">
          <PageHeader
            headingLevel={2}
            className="mb-0"
            title={user.name}
            subtitle={`${user.email} · ${user.company.name}`}
            actions={
              // Solo con la lista en caché: el post creado se inserta en ella.
              postsQuery.isSuccess && (
                <Button aria-haspopup="dialog" onClick={() => setIsFormOpen(true)}>
                  <Plus size={16} />
                  Nueva publicación
                </Button>
              )
            }
          />
        </div>
      </div>

      {/* En escritorio solo la lista hace scroll: cabecera, contador y paginación quedan fijos. */}
      <section className="fill-panel__grow" aria-labelledby={postsHeadingId}>
        <h3
          ref={postsHeadingRef}
          id={postsHeadingId}
          className="h6 fw-normal text-body-secondary mb-3 flex-shrink-0"
        >
          {postsQuery.isSuccess
            ? `${posts.length} ${posts.length === 1 ? 'publicación' : 'publicaciones'}`
            : 'Publicaciones'}
        </h3>

        {/* `key`: cada página monta la zona de scroll de nuevo y empieza arriba (escritorio). */}
        <div key={currentPage} className="fill-panel__scroll px-1 pb-1">
          {postsQuery.isPending && <PostListSkeleton />}
          {postsQuery.isError && (
            <ErrorState
              title="No se pudieron cargar las publicaciones"
              message={getErrorMessage(postsQuery.error)}
              onRetry={() => void postsQuery.refetch()}
              isRetrying={postsQuery.isFetching}
            />
          )}
          {postsQuery.isSuccess && (
            <PostList posts={visiblePosts} highlightedPostId={createdPostId} />
          )}
        </div>

        {postsQuery.isSuccess && (
          <Pagination
            className="flex-shrink-0 pt-3"
            page={currentPage}
            pageCount={pageCount}
            total={posts.length}
            pageSize={POSTS_PAGE_SIZE}
            onPageChange={changePage}
            label="Paginación de publicaciones"
          />
        )}
      </section>

      <Drawer
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Nueva publicación"
        description={`Se publicará como ${user.name}.`}
      >
        <PostForm isSubmitting={createPost.isPending} onSubmit={handleCreate} />
      </Drawer>
    </div>
  );
}
