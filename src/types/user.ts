export interface UserRecord {
  id: string;
  email: string;
  /** Hash bcrypt; nunca exponer en respuestas HTTP. */
  passwordHash: string;
}

export interface PublicUser {
  id: string;
  email: string;
}
