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
  photoUrl?: string; // Data URL for profile picture
}

export type AiAgent = 'gemini-flash' | 'gemini-pro';

export type ChatMode = 'text' | 'image' | 'multimodal' | 'voice' | 'code' | 'live';

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
}
