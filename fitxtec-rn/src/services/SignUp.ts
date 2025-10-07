import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
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

export async function signUpWithEmailPassword(email: string, contrasenna: string, nombre: string, fechaNacimiento: Date): Promise<UsuarioIngresar | null> {
  const emailValido = await validateEmail(email);
  const contrasennaValida = await validatePassword(contrasenna);
  const emailExistente = await comprobarEmail(email);
  

  if (!emailValido || !contrasennaValida || emailExistente) {
    return null;
  }
  const edad = Math.floor((new Date().getTime() - fechaNacimiento.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  console.log(edad);
  const UsuarioIngresar: UsuarioIngresar = {
    email,
    contrasenna,
    nombre,
    edad, 
    objetivo: "",
    experiencia: "",
    workoutsPorSemana: "",
    unidadPeso: "",
    unidadDistancia: ""
  };

  return UsuarioIngresar;
}

export async function signUpTraining(goal: string, experience: string, workouts: string, usuario: UsuarioIngresar): Promise<UsuarioIngresar | null> {
  if (!usuario) {
    return null;
  }

  const updatedUsuario: UsuarioIngresar = {
    ...usuario,
    objetivo: goal,
    experiencia: experience,
    workoutsPorSemana: workouts,
  };

  return updatedUsuario;
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
    const docRef = await addDoc(collection(db, "usuarios"), {
      ...updatedUsuario,
      createdAt: new Date(),
    });
    console.log("Documento agregado con ID:", docRef.id);
  } catch (error) {
    console.error("Error al agregar documento:", error);
  }

}