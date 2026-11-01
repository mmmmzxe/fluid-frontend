export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'superAdmin' | 'admin';
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
