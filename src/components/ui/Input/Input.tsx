import { type ComponentProps, useId } from 'react';
import { cx } from '@/lib/cx';
import { type FieldProps, FormField } from '../FormField/FormField';

export interface InputProps extends ComponentProps<'input'>, FieldProps {}

/** Input con label, error, hint y contador. `ref` como prop: compatible con `register()` de RHF. */
export function Input({
  label,
  hideLabel,
  error,
  hint,
  characterCount,
  containerClassName,
  id,
  className,
  required,
  'aria-describedby': describedBy,
  ...props
}: InputProps) {
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
        <input
          className={cx('form-control', error && 'is-invalid', className)}
          required={required}
          {...props}
          {...a11yProps}
        />
      )}
    </FormField>
  );
}
