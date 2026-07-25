import { create } from 'zustand';

interface User {
  username: string;
  email: string;
  avatarUrl: string;
  tier: 'Free' | 'Pro' | 'Enterprise';
  apiKeys: string[];
  usageCount: number;
}

interface AuthState {
  user: User | null;
  isGuest: boolean;
  login: (email: string, username?: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
  generateApiKey: () => void;
  deleteApiKey: (key: string) => void;
}

const SAMPLE_USER: User = {
  username: 'Alex Developer',
  email: 'alex@diagramgenie.io',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  tier: 'Pro',
  apiKeys: ['dg_live_8f3d12a64c09d8e12fa87'],
  usageCount: 42,
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isGuest: false,
  login: (email: string, username?: string) => 
    set({
      user: {
        ...SAMPLE_USER,
        email,
        username: username || email.split('@')[0],
      },
      isGuest: false,
    }),
  loginAsGuest: () => set({ user: null, isGuest: true }),
  logout: () => set({ user: null, isGuest: false }),
  generateApiKey: () => 
    set((state) => {
      if (!state.user) return state;
      const newKey = `dg_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
      return {
        user: {
          ...state.user,
          apiKeys: [...state.user.apiKeys, newKey],
        }
      };
    }),
  deleteApiKey: (keyToDelete: string) => 
    set((state) => {
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          apiKeys: state.user.apiKeys.filter((key) => key !== keyToDelete),
        }
      };
    }),
}));
