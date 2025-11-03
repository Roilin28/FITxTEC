// src/services/users.ts
import { addDoc, collection, getDocs, query, updateDoc, where, doc } from "firebase/firestore";
import { db } from "./firebase";

export interface Usuario {
  id: string;
  email: string;
  contrasenna: string;
  nombre?: string;
  edad?: number;
  objetivo?: string;
  experiencia?: string;
  workoutsPorSemana?: string;
  unidadPeso?: string;
  unidadDistancia?: string;
  createdAt?: number;
  lastLoginAt?: number;
}

// crea el doc si no existe; si existe lo “toca”
export async function ensureUsuario(email: string, contrasenna: string, extras: Partial<Usuario> = {}) {
  const q = query(collection(db, "usuarios"), where("email", "==", email));
  const snap = await getDocs(q);

  const now = Date.now();

  if (snap.empty) {
    const ref = await addDoc(collection(db, "usuarios"), {
      email,
      contrasenna,    
      createdAt: now,
      lastLoginAt: now,
      ...extras,
    });
    return { id: ref.id, email, contrasenna, ...extras } as Usuario;
  } else {
    const d = snap.docs[0];
    await updateDoc(doc(db, "usuarios", d.id), { lastLoginAt: now, ...extras });
    return { id: d.id, ...(d.data() as Omit<Usuario, "id">) } as Usuario;
  }
}
