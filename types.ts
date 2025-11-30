export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isAudioPlaying?: boolean;
}

export interface PDFData {
  name: string;
  text: string;
  pageCount: number;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  CHAT = 'CHAT',
}
