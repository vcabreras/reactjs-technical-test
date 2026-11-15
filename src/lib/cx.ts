type ClassValue = string | false | null | undefined;

/** Une clases CSS descartando valores falsy: `cx('btn', isActive && 'active')`. */
export function cx(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
