import type { PublicUser } from './user';

export interface LoginSuccessPayload {
  token: string;
  user: PublicUser;
}
