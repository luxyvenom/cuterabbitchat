import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types/user';

export function useAuth() {
  const { user, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ? mapSupabaseUser(session.user) : null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    useAuthStore.getState().logout();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signOut,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSupabaseUser(supaUser: any): User {
  return {
    id: supaUser.id,
    email: supaUser.email ?? '',
    username: supaUser.user_metadata?.full_name ?? supaUser.email?.split('@')[0] ?? '',
    avatarUrl: supaUser.user_metadata?.avatar_url ?? undefined,
    locale: 'ko',
    createdAt: supaUser.created_at,
  };
}
