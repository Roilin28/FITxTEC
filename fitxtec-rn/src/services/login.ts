import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

export interface Usuario {
  id: string;
  email: string;
  contrasenna: string;
  // Campos opcionales de perfil
  nombre?: string;
  edad?: number;
  objetivo?: string;
  experiencia?: string;
  workoutsPorSemana?: string;
  unidadPeso?: string;
  unidadDistancia?: string;
}

export async function loginWithEmailPassword(email: string, contrasenna: string): Promise<Usuario | null> {
  const q = query(collection(db, 'usuarios'), where('email', '==', email), where('contrasenna', '==', contrasenna));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...(doc.data() as Omit<Usuario, 'id'>) };
}
