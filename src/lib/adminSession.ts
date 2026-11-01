export type AdminRole = 'admin' | 'superAdmin';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminRole | 'user';
}

export function normalizeUser(raw: unknown): AdminUser | null {
  if (!raw || typeof raw !== 'object') return null;
  const user = raw as Record<string, unknown>;
  return {
    _id: String(user._id || user.id || ''), name: String(user.name || ''),
    email: String(user.email || ''), phone: String(user.phone || ''),
    role: user.role === 'admin' || user.role === 'superAdmin' ? user.role : 'user',
  };
}

export function getStoredUser(): AdminUser | null {
  try { return normalizeUser(JSON.parse(localStorage.getItem('userData') || 'null')); }
  catch { return null; }
}

export function isAdmin(user: AdminUser | null): user is AdminUser & { role: AdminRole } {
  return user?.role === 'admin' || user?.role === 'superAdmin';
}

export function clearStoredSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userData');
}

export function isInvalidSessionError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return ['jwt expired', 'invalid token', 'no access token', 'user changed his credentials']
    .some((reason) => message.includes(reason));
}
