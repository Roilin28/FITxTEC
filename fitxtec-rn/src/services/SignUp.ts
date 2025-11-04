import { addDoc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface UsuarioIngresar {
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

export async function comprobarEmail(email: string): Promise<boolean> {
  const q = query(collection(db, 'usuarios'), where('email', '==', email));
  const snap = await getDocs(q);
  if (snap.empty) return false;
  return true;
}

export async function validateEmail(email: string): Promise<boolean> {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return Promise.resolve(regex.test(email.trim()));
}

export async function validatePassword(password: string): Promise<boolean> {
  return Promise.resolve(password.length >= 6);
}

export async function signUpWithEmailPassword(email: string, contrasenna: string, nombre: string): Promise<UsuarioIngresar | null> {
  const emailValido = await validateEmail(email);
  const contrasennaValida = await validatePassword(contrasenna);
  const emailExistente = await comprobarEmail(email);
  

  if (!emailValido || !contrasennaValida || emailExistente) {
    return null;
  }
  const UsuarioIngresar: UsuarioIngresar = {
    email,
    contrasenna,
    nombre,
    // edad se calculará en la pantalla de Training con la fecha de nacimiento (no incluimos edad aquí)
    objetivo: "",
    experiencia: "",
    workoutsPorSemana: "",
    unidadPeso: "",
    unidadDistancia: ""
  };

  return UsuarioIngresar;
}

export async function signUpTraining(goal: string, experience: string, workouts: string, usuario: UsuarioIngresar, fechaNacimiento?: Date): Promise<UsuarioIngresar | null> {
  if (!usuario) {
    return null;
  }

  // Calcular edad solo si fechaNacimiento está disponible
  let edad: number | undefined = undefined;
  if (fechaNacimiento && fechaNacimiento instanceof Date && !isNaN(fechaNacimiento.getTime())) {
    edad = Math.floor((new Date().getTime() - fechaNacimiento.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  }

  const updatedUsuario: UsuarioIngresar = {
    ...usuario,
    objetivo: goal,
    experiencia: experience,
    workoutsPorSemana: workouts,
    edad,
  };

  return updatedUsuario;
}

// Helper function para remover campos undefined (Firestore no acepta undefined)
function removeUndefinedFields<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

export async function signUpSettings(weightUnit: string, distanceUnit: string, usuario: UsuarioIngresar) {
  if (!usuario) {
    return null;
  }

  const updatedUsuario: UsuarioIngresar = {
    ...usuario,
    unidadPeso: weightUnit,
    unidadDistancia: distanceUnit,
  };

   try {
    // upsert por email
    const q = query(collection(db, 'usuarios'), where('email', '==', usuario.email));
    const snap = await getDocs(q);
    
    // Remover campos undefined antes de guardar
    const cleanedUsuario = removeUndefinedFields(updatedUsuario);
    
    if (snap.empty) {
      const docRef = await addDoc(collection(db, "usuarios"), {
        ...cleanedUsuario,
        createdAt: new Date(),
      });
      console.log("Documento agregado con ID:", docRef.id);
    } else {
      const docRef = snap.docs[0].ref;
      await updateDoc(docRef, {
        ...cleanedUsuario,
        updatedAt: new Date(),
      });
      console.log("Documento actualizado:", docRef.id);
    }
  } catch (error) {
    console.error("Error guardando documento:", error);
  }

}