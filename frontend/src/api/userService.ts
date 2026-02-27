import axiosInstance from './axios';
import type { User } from '../types/user';

export const getUsers = async (): Promise<User[]> => {
  const response = await axiosInstance.get<User[]>('/users');
  return response.data;
};

export const updateUserProfile = async (
  data: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<User> => {
  const response = await axiosInstance.put<User>('/users/profile', data);
  return response.data;
};
