import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../data/supabase';

const LOCAL_USER_KEY = 'collect11.localUserId';
const MIGRATION_FLAG_KEY = 'collect11.migrationComplete';

type AppState = {
  mode: 'guest' | 'cloud';
  localUserId: string;
  session: Session | null;
  isMigrating: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  startUpgrade: () => void;
  finishMigration: () => Promise<void>;
};

export const useAppStore = create<AppState>((set, get) => ({
  mode: 'guest',
  localUserId: '',
  session: null,
  isMigrating: false,

  initialize: async () => {
    let localUserId = await AsyncStorage.getItem(LOCAL_USER_KEY);
    if (!localUserId) {
      localUserId = uuidv4();
      await AsyncStorage.setItem(LOCAL_USER_KEY, localUserId);
    }

    const { data } = await supabase.auth.getSession();
    set({
      localUserId,
      session: data.session,
      mode: data.session ? 'cloud' : 'guest',
    });

    supabase.auth.onAuthStateChange((_, session) => {
      set({ session, mode: session ? 'cloud' : 'guest' });
    });
  },

  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signUp: async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ mode: 'guest', session: null });
  },

  startUpgrade: () => set({ isMigrating: true }),

  finishMigration: async () => {
    await AsyncStorage.setItem(MIGRATION_FLAG_KEY, 'true');
    set({ isMigrating: false, mode: 'cloud' });
  },
}));

export const appStorageKeys = {
  LOCAL_USER_KEY,
  MIGRATION_FLAG_KEY,
};
