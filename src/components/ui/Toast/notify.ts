import { toast } from 'sonner';

export interface NotifyOptions {
  description?: string;
  /** Mismo id ⇒ reemplaza el toast existente en lugar de apilar otro. */
  id?: string;
  /** Duración en ms (por defecto la del `Toaster`). */
  duration?: number;
}

/**
 * API de notificaciones de la app. Único punto que conoce `sonner` junto a `Toaster`:
 * cambiar de librería solo afecta a esta carpeta.
 */
export const notify = {
  success: (message: string, options?: NotifyOptions) => toast.success(message, options),
  error: (message: string, options?: NotifyOptions) => toast.error(message, options),
  dismiss: (id?: string) => toast.dismiss(id),
};
