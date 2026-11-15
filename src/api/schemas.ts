import { z } from 'zod';

/*
 * Esquemas de respuesta: validan la forma de los datos, no reglas de negocio.
 * Las claves desconocidas se descartan (comportamiento por defecto de `z.object`).
 */

export const UserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  username: z.string(),
  email: z.string(),
  phone: z.string(),
  website: z.string(),
  address: z.object({
    city: z.string(),
  }),
  company: z.object({
    name: z.string(),
  }),
});

export type User = z.output<typeof UserSchema>;

/**
 * `id` se normaliza a string: los posts del servidor traen ids numéricos y los creados en
 * cliente usan `crypto.randomUUID()` (ver `createPost`), así ambos comparten tipo.
 */
export const PostSchema = z.object({
  id: z.number().int().positive().transform(String),
  userId: z.number().int().positive(),
  title: z.string(),
  body: z.string(),
});

export type Post = z.output<typeof PostSchema>;

export const POST_TITLE_MAX = 100;
export const POST_BODY_MAX = 500;

/** Esquema del formulario de nueva publicación (también valida la entrada de `createPost`). */
export const PostInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: 'El título es obligatorio.' })
    .max(POST_TITLE_MAX, { error: `El título no puede superar los ${POST_TITLE_MAX} caracteres.` }),
  body: z
    .string()
    .trim()
    .min(1, { error: 'El texto es obligatorio.' })
    .max(POST_BODY_MAX, { error: `El texto no puede superar los ${POST_BODY_MAX} caracteres.` }),
});

export type PostInput = z.output<typeof PostInputSchema>;
