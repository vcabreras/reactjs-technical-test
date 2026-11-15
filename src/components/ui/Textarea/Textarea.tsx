import { type ComponentProps, useId } from 'react';
import { cx } from '@/lib/cx';
import { type FieldProps, FormField } from '../FormField/FormField';

export interface TextareaProps extends ComponentProps<'textarea'>, FieldProps {}

/** Textarea con label, error, hint y contador. `ref` como prop: compatible con `register()` de RHF. */
export function Textarea({
  label,
  hideLabel,
  error,
  hint,
  characterCount,
  containerClassName,
  id,
  className,
  required,
  rows = 4,
  'aria-describedby': describedBy,
  ...props
}: TextareaProps) {
  const generatedId = useId();

  return (
    <FormField
      id={id ?? generatedId}
      label={label}
      hideLabel={hideLabel}
      error={error}
      hint={hint}
      characterCount={characterCount}
      required={required}
      describedBy={describedBy}
      containerClassName={containerClassName}
    >
      {(a11yProps) => (
        <textarea
          className={cx('form-control', error && 'is-invalid', className)}
          rows={rows}
          required={required}
          {...props}
          {...a11yProps}
        />
      )}
    </FormField>
  );
}
