import {
    addDoc,
    doc,
    getDoc,
    getDocs,
    collection,
    deleteDoc,
    query,
    where,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

/* ================== Interfaces ================== */

export interface SavedRoutine {
    id?: string;
    usuarioId: string;
    rutinaId: string;
    createdAt?: number;
}

/* ================== Helpers ================== */

const savedRoutinesCol = () => collection(db, 'savedRoutines');

const now = () => Date.now();

/* ================== CRUD Saved Routines ================== */

/**
 * Guarda una rutina a "Mis Rutinas" de un usuario
 */
export async function saveRoutine(
    usuarioId: string,
    rutinaId: string
): Promise<string> {
    // Verificar si ya está guardada
    const existing = await getSavedRoutine(usuarioId, rutinaId);
    if (existing) {
        return existing.id!;
    }

    const ref = await addDoc(savedRoutinesCol(), {
        usuarioId,
        rutinaId,
        createdAt: now(),
        serverUpdatedAt: serverTimestamp(),
    });

    return ref.id;
}

/**
 * Verifica si una rutina está guardada por un usuario
 */
export async function getSavedRoutine(
    usuarioId: string,
    rutinaId: string
): Promise<({ id: string } & SavedRoutine) | null> {
    const q = query(
        savedRoutinesCol(),
        where('usuarioId', '==', usuarioId),
        where('rutinaId', '==', rutinaId)
    );

    const snap = await getDocs(q);
    if (snap.empty) return null;

    const doc = snap.docs[0];
    return { id: doc.id, ...(doc.data() as SavedRoutine) };
}

/**
 * Obtiene todas las rutinas guardadas de un usuario
 */
export async function getSavedRoutines(
    usuarioId: string
): Promise<Array<{ id: string } & SavedRoutine>> {
    const q = query(
        savedRoutinesCol(),
        where('usuarioId', '==', usuarioId)
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as SavedRoutine) }));
}

/**
 * Elimina una rutina de "Mis Rutinas"
 */
export async function removeSavedRoutine(
    savedRoutineId: string
): Promise<void> {
    await deleteDoc(doc(savedRoutinesCol(), savedRoutineId));
}

/**
 * Elimina una rutina guardada por usuario y rutinaId
 */
export async function removeSavedRoutineByRutina(
    usuarioId: string,
    rutinaId: string
): Promise<void> {
    const saved = await getSavedRoutine(usuarioId, rutinaId);
    if (saved && saved.id) {
        await removeSavedRoutine(saved.id);
    }
}

