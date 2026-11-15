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
