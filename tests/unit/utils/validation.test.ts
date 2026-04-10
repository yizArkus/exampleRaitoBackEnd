import { isValidEmail } from '../../../src/utils/validation';

describe('isValidEmail', () => {
  it('accepts a basic email shape', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('rejects empty strings and strings without @', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('not-an-email')).toBe(false);
  });
});
