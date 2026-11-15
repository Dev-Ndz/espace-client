/** Returns `value` only when it is a same-origin path, otherwise `'/'` (prevents open redirects). */
export function safeReturnUrl(value: string | null): string {
  if (
    value === null ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.startsWith('/\\')
  ) {
    return '/';
  }
  return value;
}
