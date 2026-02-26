import axiosInstance from './axios';
import type {Event} from '../types/event';

export const getEvents = async (): Promise<Event[]> => {
  const response = await axiosInstance.get<Event[]>('/events');
  return response.data;
};

export const getEventById = async (id: number): Promise<Event> => {
  const response = await axiosInstance.get<Event>(`/events/id/${id}`);
  return response.data;
};

export const getEventsByCategory = async (
  category: string
): Promise<Event[]> => {
  const response = await axiosInstance.get<Event[]>(`/events/cat/${category}`);
  return response.data;
};

export const createEvent = async (
  eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Event> => {
  const response = await axiosInstance.post<Event>('/events', eventData);
  return response.data;
};

export const deleteEvent = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/events/id/${id}`);
};
