import axiosInstance from './axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export const login = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>(
    '/login',
    credentials
  );
  return response.data;
};

export const register = async (
  data: RegisterData
): Promise<RegisterResponse> => {
  const response = await axiosInstance.post<RegisterResponse>(
    '/register',
    data
  );
  return response.data;
};

export const refreshToken = async (
  refreshToken: string
): Promise<{accessToken: string; refreshToken: string}> => {
  const response = await axiosInstance.post('/refresh', {refreshToken});
  return response.data;
};
