export interface SanityUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthSession {
  user: SanityUser;
  token: string;
  expires: string;
}
