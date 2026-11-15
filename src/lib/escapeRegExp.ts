/**
 * Escapa los caracteres especiales de una expresión regular.
 *
 * Necesario porque el filtro `*_like` de JSONPlaceholder (json-server) interpreta el valor
 * como regex en el servidor: sin escapar, `.` devuelve todo y `(` provoca un HTTP 500.
 */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
