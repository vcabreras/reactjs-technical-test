import { CircleAlert, CircleCheck } from 'lucide-react';
import { Toaster as SonnerToaster } from 'sonner';

const TOAST_DURATION_MS = 4000;

/**
 * Contenedor de toasts. Sonner en modo `unstyled` (gestiona apilado, animación, swipe y la
 * región `aria-live`) con la apariencia de los `alert` de Bootstrap. Montar una sola vez.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      duration={TOAST_DURATION_MS}
      visibleToasts={3}
      closeButton
      containerAriaLabel="Notificaciones"
      icons={{
        success: <CircleCheck size={20} />,
        error: <CircleAlert size={20} />,
      }}
      toastOptions={{
        unstyled: true,
        closeButtonAriaLabel: 'Cerrar notificación',
        classNames: {
          toast: 'alert d-flex align-items-start gap-2 shadow w-100 mb-0 pe-5',
          success: 'alert-success',
          error: 'alert-danger',
          icon: 'flex-shrink-0 mt-1',
          content: 'd-flex flex-column gap-1',
          title: 'fw-semibold',
          description: 'small',
          closeButton:
            'btn btn-sm btn-link text-reset p-1 position-absolute top-0 end-0 m-1 opacity-75',
        },
      }}
    />
  );
}
