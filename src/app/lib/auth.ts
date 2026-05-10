export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const getUser = () => {
  if (typeof window !== 'undefined') {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }
  return null;
};

export const setAuth = (token: string, user: object) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

export const isLoggedIn = () => !!getToken();