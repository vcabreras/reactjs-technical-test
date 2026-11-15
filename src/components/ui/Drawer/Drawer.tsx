import { type ReactNode, useEffect, useId, useRef } from 'react';
import { cx } from '@/lib/cx';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Panel lateral derecho modal sobre `<dialog>` nativo con el aspecto del offcanvas de Bootstrap
 * (sin su JS). El navegador aporta foco atrapado, `inert` del resto de la página, Escape y
 * devolución del foco al cerrar. El contenido solo se monta mientras está abierto.
 */
export function Drawer({ open, onClose, title, description, children, className }: DrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Sincroniza la prop `open` con la API imperativa del <dialog> (efecto sobre el DOM).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={cx('drawer offcanvas offcanvas-end', className)}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        // Escape: el estado lo controla React, no el navegador.
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Click en el backdrop (fuera del contenido): el target es el propio <dialog>.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {open && (
        <div className="d-flex flex-column h-100">
          <div className="offcanvas-header border-bottom">
            <div>
              <h2 id={titleId} className="offcanvas-title h5">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="small text-body-secondary mb-0">
                  {description}
                </p>
              )}
            </div>
            <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose} />
          </div>
          <div className="offcanvas-body">{children}</div>
        </div>
      )}
    </dialog>
  );
}
