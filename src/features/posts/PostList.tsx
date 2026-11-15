import type { Post } from '@/api/schemas';
import { EmptyState, Skeleton, SkeletonGroup } from '@/components/ui';
import { cx } from '@/lib/cx';

interface PostListProps {
  posts: Post[];
  /** Post recién creado: se resalta brevemente. */
  highlightedPostId?: string;
}

export function PostList({ posts, highlightedPostId }: PostListProps) {
  if (posts.length === 0) {
    return (
      <EmptyState
        title="Este usuario no tiene publicaciones"
        description="Crea la primera con el formulario."
      />
    );
  }

  return (
    <ul className="list-unstyled d-flex flex-column gap-3 mb-0" aria-label="Publicaciones">
      {posts.map((post) => (
        <li key={post.id}>
          <article
            className={cx(
              'card border-0 shadow-sm',
              post.id === highlightedPostId && 'post-card--new',
            )}
            aria-labelledby={`post-${post.id}-title`}
          >
            <div className="card-body">
              <h3
                id={`post-${post.id}-title`}
                className="h6 card-title fw-semibold text-capitalize text-break"
              >
                {post.title}
              </h3>
              <p className="card-text text-body-secondary mb-0 text-break">{post.body}</p>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

export function PostListSkeleton() {
  return (
    <SkeletonGroup label="Cargando publicaciones…" className="d-flex flex-column gap-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="card border-0 shadow-sm" aria-hidden="true">
          <div className="card-body">
            <Skeleton width={6} className="mb-2" />
            <Skeleton width={12} size="sm" />
            <Skeleton width={9} size="sm" />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}
