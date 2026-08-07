import { ref } from 'vue';
import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';

const session = ref<Session | null>(null);
const ready = ref(false);

let initialized = false;

// Inizializza lo stato di sessione una sola volta e lo mantiene aggiornato.
export function initAuth() {
  if (initialized) return;
  initialized = true;
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session;
    ready.value = true;
  });
  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.value = newSession;
  });
}

export function useAuth() {
  initAuth();

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return { session, ready, signIn, signOut };
}
