export interface UserRecord {
  id: string;
  email: string;
  /** bcrypt hash; never expose in HTTP responses. */
  passwordHash: string;
}

export interface PublicUser {
  id: string;
  email: string;
}
