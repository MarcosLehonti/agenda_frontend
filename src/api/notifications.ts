import api from './axios';

export interface Notification {
  id: string;
  taskId: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get('/notifications');
  return response.data.data;
};

export const markAsRead = async (id: string): Promise<Notification> => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data.data;
};
