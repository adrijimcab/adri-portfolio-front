export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  timestamp: number;
}

export interface ChatSource {
  table: string;
  id: string;
}

export interface ChatEvent {
  type: 'chunk' | 'done' | 'error';
  content?: string;
  sources?: ChatSource[];
  error?: string;
}
