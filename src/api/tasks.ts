import api from './axios';

export interface Task {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string | null;
  status: 'Pendiente' | 'En progreso' | 'Completada';
  priority: 'Baja' | 'Media' | 'Alta';
  color: string;
}

export const getTasks = async () => {
  const response = await api.get('/tasks');
  return response.data.data;
};

export const createTask = async (task: Partial<Task>) => {
  const response = await api.post('/tasks', task);
  return response.data.data;
};

export const updateTask = async (id: string, task: Partial<Task>) => {
  const response = await api.put(`/tasks/${id}`, task);
  return response.data.data;
};

export const updateTaskStatus = async (id: string, status: string) => {
  const response = await api.patch(`/tasks/${id}/status`, { status });
  return response.data.data;
};

export const deleteTask = async (id: string) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};
