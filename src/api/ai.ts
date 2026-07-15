import api from './axios';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const sendChatMessage = async (message: string, history: ChatMessage[]) => {
  const response = await api.post('/ai/chat', { message, history });
  return response.data.text;
};
