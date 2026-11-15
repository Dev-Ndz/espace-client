import { safeReturnUrl } from './safe-return-url';

describe('safeReturnUrl', () => {
  it.each(['/', '/projets?x=1'])('keeps the local path %s', (value) => {
    expect(safeReturnUrl(value)).toBe(value);
  });

  it.each([
    null,
    '',
    '//evil.example',
    '/\\evil.example',
    'https://evil.example',
    'javascript:alert(1)',
  ])('falls back to / for %s', (value) => {
    expect(safeReturnUrl(value)).toBe('/');
  });
});
