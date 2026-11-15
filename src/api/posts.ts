import { request } from './client';
import { ApiError } from './errors';
import { type Post, type PostInput, PostInputSchema, PostSchema } from './schemas';

/** Posts de un usuario. Sin paginar a propósito (ver CLAUDE.md, "Posts sin paginar"). */
export function getPostsByUser(userId: number, signal?: AbortSignal): Promise<Post[]> {
  return request('/posts', {
    schema: PostSchema.array(),
    query: { userId },
    signal,
  });
}

export interface CreatePostInput extends PostInput {
  userId: number;
}

/**
 * Crea un post. JSONPlaceholder no persiste y responde siempre `id: 101`, así que se sustituye
 * por un id generado en cliente para que varios posts creados no compartan `key`.
 */
export async function createPost(input: CreatePostInput, signal?: AbortSignal): Promise<Post> {
  const parsed = PostInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError({
      kind: 'validation',
      message: 'POST /posts: datos de entrada inválidos',
      cause: parsed.error,
    });
  }

  const created = await request('/posts', {
    method: 'POST',
    body: { userId: input.userId, ...parsed.data },
    schema: PostSchema,
    signal,
  });

  return { ...created, id: crypto.randomUUID() };
}
