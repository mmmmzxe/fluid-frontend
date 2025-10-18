// Authentication and role utility functions

export type UserRole = 'superAdmin' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: UserRole;
}

/**
 * Check if user has admin access (superAdmin or admin)
 */
export const hasAdminAccess = (user: User | null): boolean => {
  return user?.role === 'superAdmin' || user?.role === 'admin';
};

/**
 * Check if user is super admin
 */
export const isSuperAdmin = (user: User | null): boolean => {
  return user?.role === 'superAdmin';
};

/**
 * Check if user is regular admin
 */
export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};

/**
 * Get user data from localStorage
 */
export const getUserFromStorage = (): User | null => {
  try {
    const userData = localStorage.getItem('userData');
    if (!userData) return null;
    
    const parsed = JSON.parse(userData);
    return {
      id: parsed._id || parsed.id || '',
      name: parsed.name || '',
      email: parsed.email || '',
      phone: parsed.phone || '',
      role: parsed.role || undefined,
    };
  } catch (error) {
    console.error('Error parsing user data from storage:', error);
    return null;
  }
};

/**
 * Save user data to localStorage
 */
export const saveUserToStorage = (user: any): void => {
  try {
    localStorage.setItem('userData', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user data to storage:', error);
  }
};

/**
 * Clear user data from localStorage
 */
export const clearUserFromStorage = (): void => {
  localStorage.removeItem('userData');
  localStorage.removeItem('accessToken');
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

/**
 * Save access token to localStorage
 */
export const saveAccessToken = (token: string): void => {
  localStorage.setItem('accessToken', token);
};

/**
 * Clear access token from localStorage
 */
export const clearAccessToken = (): void => {
  localStorage.removeItem('accessToken');
};


