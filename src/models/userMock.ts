import type { UserRecord } from '../types/user';

/**
 * Mock en memoria. Contraseña en texto plano documentada solo aquí para desarrollo:
 * email: user@example.com → password: password123
 * Hash generado con bcrypt (10 rounds), verificado con bcrypt.compare.
 */
const MOCK_PASSWORD_HASH = '$2b$10$yf.WKRG6etFSo6FuNfnVMePGsirij3WXX3BBEPypfy1vmoHSkHKUC';

const MOCK_USERS: readonly UserRecord[] = [
  {
    id: 'usr_mock_001',
    email: 'user@example.com',
    passwordHash: MOCK_PASSWORD_HASH,
  },
];

export function findUserByEmail(email: string): UserRecord | undefined {
  const normalized = email.trim().toLowerCase();
  return MOCK_USERS.find(u => u.email.toLowerCase() === normalized);
}
