import { Search, X } from 'lucide-react';
import { type ComponentProps, type KeyboardEvent, useId, useRef } from 'react';
import { cx } from '@/lib/cx';
import { Button } from '../Button/Button';
import { type FieldProps, FormField } from '../FormField/FormField';
import { Spinner } from '../Spinner/Spinner';

export interface SearchInputProps
  extends
    Omit<ComponentProps<'input'>, 'value' | 'onChange' | 'type' | 'ref'>,
    Omit<FieldProps, 'characterCount'> {
  value: string;
  onValueChange: (value: string) => void;
  /** Hay una búsqueda en curso: sustituye el icono por un spinner anunciado. */
  isSearching?: boolean;
  clearLabel?: string;
}

/**
 * Campo de búsqueda controlado con icono, botón limpiar (también con Escape) e indicador de
 * búsqueda en curso. El debounce y la petición los gestiona quien lo usa.
 */
export function SearchInput({
  label,
  hideLabel = true,
  error,
  hint,
  containerClassName,
  value,
  onValueChange,
  isSearching = false,
  clearLabel = 'Limpiar búsqueda',
  id,
  className,
  onKeyDown,
  'aria-describedby': describedBy,
  ...props
}: SearchInputProps) {
  const generatedId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const clear = () => {
    onValueChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.key === 'Escape' && value !== '') {
      event.preventDefault();
      clear();
    }
  };

  return (
    <FormField
      id={id ?? generatedId}
      label={label}
      hideLabel={hideLabel}
      error={error}
      hint={hint}
      describedBy={describedBy}
      containerClassName={containerClassName}
    >
      {(a11yProps) => (
        <div className="input-group">
          <span className="input-group-text">
            {isSearching ? <Spinner size="sm" label="Buscando…" /> : <Search size={16} />}
          </span>
          <input
            ref={inputRef}
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            className={cx('form-control', error && 'is-invalid', className)}
            {...props}
            {...a11yProps}
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          {value !== '' && (
            <Button variant="outline-secondary" aria-label={clearLabel} onClick={clear}>
              <X size={16} />
            </Button>
          )}
        </div>
      )}
    </FormField>
  );
}
