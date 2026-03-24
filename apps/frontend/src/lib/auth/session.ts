import { jwtDecode } from 'jwt-decode';

export interface Session {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
  expiresAt: number;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
}

export function isTokenValid(token: string): boolean {
  try {
    const decoded: any = jwtDecode(token);
    return decoded.exp ? decoded.exp * 1000 > Date.now() : false;
  } catch {
    return false;
  }
}

export function getSession(): Session | null {
  const token = getToken();
  if (!token || !isTokenValid(token)) {
    return null;
  }

  try {
    const decoded: any = jwtDecode(token);
    return {
      token,
      user: {
        id: decoded.sub || decoded.userId,
        email: decoded.email,
        role: decoded.role || 'customer',
      },
      expiresAt: decoded.exp * 1000,
    };
  } catch {
    return null;
  }
}

export function decodeToken(token: string): any {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}
