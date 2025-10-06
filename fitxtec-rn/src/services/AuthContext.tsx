import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Usuario } from './login';
import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface AuthContextValue {
  user: Usuario | null;
  setUser: (u: Usuario | null) => void;
  signOut: () => void;
  updateUserFields: (fields: Partial<Usuario>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);

  const signOut = () => {
    setUser(null);
  };

  const updateUserFields = async (fields: Partial<Usuario>) => {
    if (!user) return;
    try {
      const ref = doc(db, 'usuarios', user.id);
      await updateDoc(ref, fields);
      // merge locally
      setUser({ ...user, ...fields });
    } catch (e) {
      console.warn('Error updating user', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, signOut, updateUserFields }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
