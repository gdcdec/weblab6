import axios from 'axios';
import {
  getAccessToken,
  setAccessToken,
  setRefreshToken,
  getRefreshToken,
  removeAccessToken,
  removeRefreshToken,
  removeUser,
} from '../utils/storage';
import { refreshToken as refreshTokenApi } from './authService';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    if (config.url?.includes('/refresh')) {
      return config;
    }
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      removeAccessToken();
      removeRefreshToken();
      removeUser();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await refreshTokenApi(refreshToken);
      const { accessToken, refreshToken: newRefreshToken } = response;

      setAccessToken(accessToken);
      setRefreshToken(newRefreshToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      processQueue(null, accessToken);
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      const errorObj =
        refreshError instanceof Error
          ? refreshError
          : new Error('Token refresh failed');
      processQueue(errorObj, null);
      removeAccessToken();
      removeRefreshToken();
      removeUser();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
