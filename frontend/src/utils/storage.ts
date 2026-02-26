const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const setAccessToken = (token: string) =>
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const removeAccessToken = () =>
  localStorage.removeItem(ACCESS_TOKEN_KEY);

export const setRefreshToken = (token: string) =>
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const removeRefreshToken = () =>
  localStorage.removeItem(REFRESH_TOKEN_KEY);

export const setUser = (user: any) =>
  localStorage.setItem(USER_KEY, JSON.stringify(user));
export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};
export const removeUser = () => localStorage.removeItem(USER_KEY);

export const clearAuth = () => {
  removeAccessToken();
  removeRefreshToken();
  removeUser();
};
