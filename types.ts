export type MessageRole = 'user' | 'model';

export interface ChatMessage {
  role: MessageRole;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  attachment?: string; // Data URL for user-uploaded image
}

export interface User {
  name: string;
  email: string;
  password?: string; // Optional because we don't store it in the session
}

export type AiAgent = 'gemini-flash' | 'gemini-pro';

export type ChatMode = 'text' | 'image' | 'multimodal' | 'voice' | 'code';