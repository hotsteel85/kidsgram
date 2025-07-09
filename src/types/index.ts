export interface Memory {
  id?: string;
  date: string; // yyyy-mm-dd format
  photoUrl?: string;
  audioUrl?: string;
  note?: string;
  emotion?: string; // 감정 이모티콘 (😢, 😕, 😐, 🙂, 😊)
  createdAt: Date;
  userId: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
} 