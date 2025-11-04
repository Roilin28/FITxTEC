import {
    addDoc,
    doc,
    getDoc,
    getDocs,
    collection,
    updateDoc,
    deleteDoc,
    query,
    where,
    Timestamp,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { getTodayLocal, parseLocalDate } from './dateUtils';

/* ================== Interfaces ================== */

export interface RutinaEnProgreso {
    id?: string;
    usuarioId: string;
    rutinaId: string; // ID de la rutina original
    cantidadDias: number; // Total de días de la rutina
    diaActual: number; // Día actual que está realizando (1, 2, 3, etc.)
    terminada: boolean; // Indica si la rutina está completada
    fechaInicio: string; // Fecha de inicio en formato YYYY-MM-DD
    fechaInicioTimestamp?: Timestamp; // Timestamp para queries
    createdAt?: number;
    updatedAt?: number;
}

export interface SerieEjercicio {
    set: number;
    reps: number;
    weight: number; // en kg
    done: boolean;
    restTime?: number; // segundos de descanso
}

export interface EjercicioWorkout {
    nombre: string;
    series: SerieEjercicio[];
    notas?: string;
}

export interface WorkoutSession {
    id?: string;
    rutinaEnProgresoId: string; // ID de la rutina en progreso
    usuarioId: string;
    dia: number; // Día de la rutina (1, 2, 3, etc.)
    fecha: string; // formato: YYYY-MM-DD
    fechaTimestamp?: Timestamp;
    ejercicios: EjercicioWorkout[];
    volumen: number; // volumen total en kg
    duracion?: number; // duración en minutos
    calorias?: number;
    createdAt?: number;
    updatedAt?: number;
}

/* ================== Helpers ================== */

const rutinasEnProgresoCol = () => collection(db, 'rutinasEnProgreso');
const workoutSessionsCol = () => collection(db, 'workoutSessions');

const now = () => Date.now();

function calcularVolumen(ejercicios: EjercicioWorkout[]): number {
    return ejercicios.reduce((total, ejercicio) => {
        const volumenEjercicio = ejercicio.series.reduce((sum, serie) => {
            return sum + (serie.done ? serie.weight * serie.reps : 0);
        }, 0);
        return total + volumenEjercicio;
    }, 0);
}

/* ================== CRUD Rutinas en Progreso ================== */

/**
 * Crea una nueva rutina en progreso
 */
export async function crearRutinaEnProgreso(
    usuarioId: string,
    rutinaId: string,
    cantidadDias: number
): Promise<string> {
    const fechaHoy = getTodayLocal();
    const fechaTimestamp = Timestamp.fromDate(parseLocalDate(fechaHoy));

    const rutinaData: Omit<RutinaEnProgreso, 'id'> = {
        usuarioId,
        rutinaId,
        cantidadDias,
        diaActual: 1,
        terminada: false,
        fechaInicio: fechaHoy,
        fechaInicioTimestamp: fechaTimestamp,
        createdAt: now(),
        updatedAt: now(),
    };

    const ref = await addDoc(rutinasEnProgresoCol(), {
        ...rutinaData,
        serverUpdatedAt: serverTimestamp(),
    });

    return ref.id;
}

/**
 * Obtiene todas las rutinas en progreso de un usuario (no terminadas)
 */
export async function getRutinasEnProgreso(
    usuarioId: string
): Promise<Array<{ id: string } & RutinaEnProgreso>> {
    const q = query(
        rutinasEnProgresoCol(),
        where('usuarioId', '==', usuarioId),
        where('terminada', '==', false)
    );

    const snap = await getDocs(q);
    const results = snap.docs.map((d) => ({ id: d.id, ...(d.data() as RutinaEnProgreso) }));
    
    // Ordenar por updatedAt descendente en memoria
    results.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    
    return results;
}

/**
 * Obtiene una rutina en progreso por ID
 */
export async function getRutinaEnProgreso(
    rutinaEnProgresoId: string
): Promise<({ id: string } & RutinaEnProgreso) | null> {
    const snap = await getDoc(doc(rutinasEnProgresoCol(), rutinaEnProgresoId));
    if (!snap.exists()) return null;

    return { id: snap.id, ...(snap.data() as RutinaEnProgreso) };
}

/**
 * Avanza al siguiente día de una rutina en progreso
 */
export async function avanzarDiaRutina(
    rutinaEnProgresoId: string
): Promise<{ terminada: boolean }> {
    const rutina = await getRutinaEnProgreso(rutinaEnProgresoId);
    if (!rutina) throw new Error('Rutina en progreso no encontrada');

    const nuevoDia = rutina.diaActual + 1;
    const terminada = nuevoDia > rutina.cantidadDias;

    await updateDoc(doc(rutinasEnProgresoCol(), rutinaEnProgresoId), {
        diaActual: terminada ? rutina.cantidadDias : nuevoDia,
        terminada,
        updatedAt: now(),
        serverUpdatedAt: serverTimestamp(),
    });

    return { terminada };
}

/**
 * Marca una rutina en progreso como terminada
 */
export async function terminarRutinaEnProgreso(
    rutinaEnProgresoId: string
): Promise<void> {
    await updateDoc(doc(rutinasEnProgresoCol(), rutinaEnProgresoId), {
        terminada: true,
        updatedAt: now(),
        serverUpdatedAt: serverTimestamp(),
    });
}

/**
 * Elimina una rutina en progreso
 */
export async function eliminarRutinaEnProgreso(
    rutinaEnProgresoId: string
): Promise<void> {
    await deleteDoc(doc(rutinasEnProgresoCol(), rutinaEnProgresoId));
}

/* ================== CRUD Workout Sessions ================== */

/**
 * Crea una nueva sesión de workout
 */
export async function crearWorkoutSession(
    rutinaEnProgresoId: string,
    usuarioId: string,
    dia: number,
    ejercicios: EjercicioWorkout[],
    duracion?: number,
    calorias?: number
): Promise<string> {
    const fechaHoy = getTodayLocal();
    const fechaTimestamp = Timestamp.fromDate(parseLocalDate(fechaHoy));
    const volumen = calcularVolumen(ejercicios);

    const sessionData: any = {
        rutinaEnProgresoId,
        usuarioId,
        dia,
        fecha: fechaHoy,
        fechaTimestamp,
        ejercicios,
        volumen,
        duracion: duracion,
        calorias: calorias,
        createdAt: now(),
        updatedAt: now(),
    };

    // Filtrar valores undefined para evitar errores en Firestore
    const cleanData = Object.fromEntries(
        Object.entries(sessionData).filter(([_, value]) => value !== undefined)
    );

    const ref = await addDoc(workoutSessionsCol(), {
        ...cleanData,
        serverUpdatedAt: serverTimestamp(),
    });

    return ref.id;
}

/**
 * Obtiene todas las sesiones de workout de una rutina en progreso
 */
export async function getWorkoutSessionsDeRutina(
    rutinaEnProgresoId: string
): Promise<Array<{ id: string } & WorkoutSession>> {
    const q = query(
        workoutSessionsCol(),
        where('rutinaEnProgresoId', '==', rutinaEnProgresoId)
    );

    const snap = await getDocs(q);
    const sessions = snap.docs.map((d) => ({ id: d.id, ...(d.data() as WorkoutSession) }));
    
    // Ordenar por día descendente
    return sessions.sort((a, b) => b.dia - a.dia);
}

/**
 * Obtiene las sesiones de workout de un usuario en un rango de fechas
 */
export async function getWorkoutSessionsPorFecha(
    usuarioId: string,
    fechaInicio: string,
    fechaFin: string
): Promise<Array<{ id: string } & WorkoutSession>> {
    const inicioTimestamp = Timestamp.fromDate(parseLocalDate(fechaInicio));
    const finTimestamp = Timestamp.fromDate(parseLocalDate(fechaFin + 'T23:59:59'));

    const q = query(
        workoutSessionsCol(),
        where('usuarioId', '==', usuarioId)
    );

    const snap = await getDocs(q);
    const allSessions = snap.docs.map((d) => ({ id: d.id, ...(d.data() as WorkoutSession) }));

    // Filtrar por rango de fechas en memoria
    const sessions = allSessions.filter((session) => {
        const fecha = session.fechaTimestamp?.toMillis() || session.createdAt || 0;
        const inicio = inicioTimestamp.toMillis();
        const fin = finTimestamp.toMillis();
        return fecha >= inicio && fecha <= fin;
    });

    // Ordenar por fechaTimestamp descendente
    return sessions.sort((a, b) => {
        const fechaA = a.fechaTimestamp?.toMillis() || a.createdAt || 0;
        const fechaB = b.fechaTimestamp?.toMillis() || b.createdAt || 0;
        return fechaB - fechaA;
    });
}

/**
 * Obtiene la última sesión de workout de un usuario
 */
export async function getUltimaWorkoutSession(
    usuarioId: string
): Promise<({ id: string } & WorkoutSession) | null> {
    const q = query(
        workoutSessionsCol(),
        where('usuarioId', '==', usuarioId)
    );

    const snap = await getDocs(q);
    const allSessions = snap.docs.map((d) => ({ id: d.id, ...(d.data() as WorkoutSession) }));

    // Ordenar por fechaTimestamp descendente
    const sessions = allSessions.sort((a, b) => {
        const fechaA = a.fechaTimestamp?.toMillis() || a.createdAt || 0;
        const fechaB = b.fechaTimestamp?.toMillis() || b.createdAt || 0;
        return fechaB - fechaA;
    });

    return sessions.length > 0 ? sessions[0] : null;
}

