import { type ComponentProps, type ReactNode, useId } from 'react';
import { cx } from '@/lib/cx';

type HeadingLevel = 2 | 3 | 4;

export interface CardProps extends Omit<ComponentProps<'div'>, 'title' | 'ref'> {
  /** Con título, la card es una región (`<section>`) etiquetada por su encabezado. */
  title?: ReactNode;
  headingLevel?: HeadingLevel;
  /** Contenido a la derecha del título (botones, contadores…). */
  actions?: ReactNode;
  footer?: ReactNode;
  bodyClassName?: string;
}

export function Card({
  title,
  headingLevel = 2,
  actions,
  footer,
  className,
  bodyClassName,
  children,
  ...props
}: CardProps) {
  const headingId = useId();
  const Heading = `h${headingLevel}` as const;
  const Container = title ? 'section' : 'div';

  return (
    <Container
      className={cx('card shadow-sm', className)}
      aria-labelledby={title ? headingId : undefined}
      {...props}
    >
      {(title || actions) && (
        <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
          {title && (
            <Heading id={headingId} className="h6 mb-0">
              {title}
            </Heading>
          )}
          {actions && <div className="d-flex align-items-center gap-2 ms-auto">{actions}</div>}
        </div>
      )}
      <div className={cx('card-body', bodyClassName)}>{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </Container>
  );
}
