import { useState, useEffect, useCallback, useRef } from 'react';
import { User, AuthState } from '../types';
import { signInWithGoogle, signOutUser, onAuthStateChange } from '../services/auth';

export const useOptimizedAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setAuthState({
        user,
        loading: false,
        error: null,
      });
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const login = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const user = await signInWithGoogle();
      setAuthState({
        user,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '로그인에 실패했습니다.',
      }));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await signOutUser();
      setAuthState({
        user: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '로그아웃에 실패했습니다.',
      }));
    }
  }, []);

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    logout,
  };
}; 