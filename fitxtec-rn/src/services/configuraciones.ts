// src/services/configuraciones.ts
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";

export interface ConfiguracionUsuario {
  id?: string;
  userId: string;
  // Notificaciones
  workoutReminders?: boolean;
  progressUpdates?: boolean;
  restDayReminders?: boolean;
  prCelebrations?: boolean;
  // Unidades
  unidadPeso?: string;
  unidadDistancia?: string;
  // Otros ajustes
  theme?: string;
  language?: string;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Obtiene la configuración de un usuario
 * Si no existe, crea una con valores por defecto
 */
export async function getConfiguracionUsuario(
  userId: string
): Promise<ConfiguracionUsuario | null> {
  try {
    const q = query(
      collection(db, "configuraciones"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docData = snapshot.docs[0].data();
      return {
        id: snapshot.docs[0].id,
        ...docData,
      } as ConfiguracionUsuario;
    }

    // Si no existe, crear una configuración por defecto
    const defaultConfig: ConfiguracionUsuario = {
      userId,
      workoutReminders: true,
      progressUpdates: true,
      restDayReminders: false,
      prCelebrations: true,
      unidadPeso: "kg",
      unidadDistancia: "km",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const docRef = doc(collection(db, "configuraciones"));
    await setDoc(docRef, defaultConfig);
    return {
      id: docRef.id,
      ...defaultConfig,
    };
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    return null;
  }
}

/**
 * Actualiza la configuración de un usuario
 */
export async function updateConfiguracionUsuario(
  userId: string,
  updates: Partial<ConfiguracionUsuario>
): Promise<boolean> {
  try {
    const q = query(
      collection(db, "configuraciones"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);

    const updateData = {
      ...updates,
      updatedAt: Date.now(),
    };

    if (!snapshot.empty) {
      // Actualizar documento existente
      const docRef = doc(db, "configuraciones", snapshot.docs[0].id);
      await updateDoc(docRef, updateData);
      return true;
    } else {
      // Crear nuevo documento
      const newConfig: ConfiguracionUsuario = {
        userId,
        workoutReminders: true,
        progressUpdates: true,
        restDayReminders: false,
        prCelebrations: true,
        unidadPeso: "kg",
        unidadDistancia: "km",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...updates,
      };
      const docRef = doc(collection(db, "configuraciones"));
      await setDoc(docRef, newConfig);
      return true;
    }
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    return false;
  }
}

/**
 * Crea o actualiza la configuración completa de un usuario
 */
export async function setConfiguracionUsuario(
  config: ConfiguracionUsuario
): Promise<boolean> {
  try {
    const q = query(
      collection(db, "configuraciones"),
      where("userId", "==", config.userId)
    );
    const snapshot = await getDocs(q);

    const configData = {
      ...config,
      updatedAt: Date.now(),
      ...(config.createdAt ? {} : { createdAt: Date.now() }),
    };

    if (!snapshot.empty) {
      const docRef = doc(db, "configuraciones", snapshot.docs[0].id);
      await updateDoc(docRef, configData);
      return true;
    } else {
      const docRef = doc(collection(db, "configuraciones"));
      await setDoc(docRef, {
        ...configData,
        createdAt: Date.now(),
      });
      return true;
    }
  } catch (error) {
    console.error("Error al guardar configuración:", error);
    return false;
  }
}

