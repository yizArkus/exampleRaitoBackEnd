import { isValidEmail } from '../../../src/utils/validation';

describe('isValidEmail', () => {
  it('acepta un email con formato básico', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('rechaza cadenas vacías o sin @', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('not-an-email')).toBe(false);
  });
});
