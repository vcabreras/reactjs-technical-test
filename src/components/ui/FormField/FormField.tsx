import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

export interface CharacterCount {
  current: number;
  max: number;
}

/** Props de accesibilidad que `FormField` entrega al control que envuelve. */
export interface FormControlA11yProps {
  id: string;
  'aria-invalid': true | undefined;
  'aria-describedby': string | undefined;
}

/** Props comunes a todos los controles de formulario de `ui/`. */
export interface FieldProps {
  label: string;
  /** Oculta el label visualmente; sigue siendo el nombre accesible. */
  hideLabel?: boolean;
  /** Mensaje de error; marca el control como inválido. */
  error?: string;
  hint?: ReactNode;
  characterCount?: CharacterCount;
  /** Clase del contenedor (la `className` va al control). */
  containerClassName?: string;
}

interface FormFieldProps extends FieldProps {
  id: string;
  required?: boolean;
  /** `aria-describedby` propio del control, se combina con los generados. */
  describedBy?: string;
  children: (a11yProps: FormControlA11yProps) => ReactNode;
}

/** Estructura interna de label + control + error + hint + contador. No se exporta desde `ui/`. */
export function FormField({
  id,
  label,
  hideLabel = false,
  error,
  hint,
  characterCount,
  required = false,
  describedBy,
  containerClassName,
  children,
}: FormFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const countId = `${id}-count`;
  const isOverLimit = characterCount !== undefined && characterCount.current > characterCount.max;

  const ariaDescribedBy =
    [
      error ? errorId : undefined,
      hint ? hintId : undefined,
      characterCount ? countId : undefined,
      describedBy,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div className={cx('mb-3', containerClassName)}>
      <label htmlFor={id} className={cx('form-label', hideLabel && 'visually-hidden')}>
        {label}
        {required && (
          <span className="text-danger ms-1" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': ariaDescribedBy,
      })}

      {error && (
        <div id={errorId} className="invalid-feedback d-block">
          {error}
        </div>
      )}

      {(hint || characterCount) && (
        <div className="d-flex justify-content-between gap-2">
          {hint ? (
            <div id={hintId} className="form-text">
              {hint}
            </div>
          ) : (
            <span />
          )}
          {characterCount && (
            <div
              id={countId}
              className={cx('form-text text-nowrap', isOverLimit && 'text-danger fw-semibold')}
            >
              <span aria-hidden="true">
                {characterCount.current}/{characterCount.max}
              </span>
              <span className="visually-hidden">
                {`${characterCount.current} de ${characterCount.max} caracteres`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
