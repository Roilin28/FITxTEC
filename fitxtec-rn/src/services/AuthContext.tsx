import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from './login';
import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextValue {
  user: Usuario | null;
  setUser: (u: Usuario | null) => void;
  signOut: () => Promise<void>;
  updateUserFields: (fields: Partial<Usuario>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_STORAGE_KEY = '@fitxtec_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          setUserState(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Error loading user from storage:', e);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Función setUser que también guarda en AsyncStorage
  const setUser = async (u: Usuario | null) => {
    setUserState(u);
    try {
      if (u) {
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
      } else {
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error saving user to storage:', e);
    }
  };

  const signOut = async () => {
    setUserState(null);
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.error('Error removing user from storage:', e);
    }
  };

  const updateUserFields = async (fields: Partial<Usuario>) => {
    if (!user) return;
    try {
      const ref = doc(db, 'usuarios', user.id);
      await updateDoc(ref, fields);
      // merge locally
      const updatedUser = { ...user, ...fields };
      setUserState(updatedUser);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (e) {
      console.warn('Error updating user', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, signOut, updateUserFields, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
