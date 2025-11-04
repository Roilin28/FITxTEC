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
    orderBy,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { 
    getMuscleGroupsForExercise, 
    MuscleGroup 
} from './muscleGroups';
import { getTodayLocal, parseLocalDate, formatLocalDate } from './dateUtils';

/* ================== Interfaces ================== */

export interface SerieEjercicio {
    set: number;
    reps: number;
    weight: number; // en kg
    done: boolean;
    restTime?: number; // segundos de descanso
}

export interface EjercicioWorkout {
    id?: string;
    nombre: string;
    series: SerieEjercicio[];
    notas?: string;
}

export interface Workout {
    id?: string;
    usuarioId: string;
    rutinaId?: string; // ID de la rutina asociada (opcional)
    fecha: string; // formato: YYYY-MM-DD
    fechaTimestamp?: Timestamp; // timestamp de Firebase para queries
    tipo?: string; // ej: "Full Body", "Push Day", etc.
    duracion?: number; // duración en minutos
    volumen?: number; // volumen total en kg (suma de todas las series)
    calorias?: number;
    completado: boolean;
    diaActual?: number; // Día actual de la rutina (1, 2, 3, etc.)
    ejercicios?: EjercicioWorkout[];
    notas?: string;
    inicioTimestamp?: number; // Timestamp cuando se inicia el workout
    createdAt?: number;
    updatedAt?: number;
}

/* ================== Helpers ================== */

const workoutsCol = () => collection(db, 'workouts');

const now = () => Date.now();

function calcularVolumen(ejercicios: EjercicioWorkout[]): number {
    return ejercicios.reduce((total, ejercicio) => {
        const volumenEjercicio = ejercicio.series.reduce((sum, serie) => {
            return sum + (serie.done ? serie.weight * serie.reps : 0);
        }, 0);
        return total + volumenEjercicio;
    }, 0);
}

function calcularDuracion(inicioTimestamp: number): number {
    // Si se pasa el timestamp de inicio, calcula la diferencia
    return Math.round((Date.now() - inicioTimestamp) / 1000 / 60); // minutos
}

/* ================== CRUD Workouts ================== */

/**
 * Crea un nuevo workout (sesión de entrenamiento)
 */
export async function createWorkout(
    data: Omit<Workout, 'id' | 'createdAt' | 'updatedAt' | 'fechaTimestamp'>
): Promise<string> {
    const fechaTimestamp = Timestamp.fromDate(parseLocalDate(data.fecha));

    const workoutData: Omit<Workout, 'id'> = {
        ...data,
        fechaTimestamp,
        createdAt: now(),
        updatedAt: now(),
        volumen: data.ejercicios ? calcularVolumen(data.ejercicios) : 0,
    };

    const ref = await addDoc(workoutsCol(), {
        ...workoutData,
        serverUpdatedAt: serverTimestamp(),
    });
    return ref.id;
}

/**
 * Actualiza un workout existente
 */
export async function updateWorkout(
    workoutId: string,
    data: Partial<Workout>
): Promise<void> {
    const ref = doc(workoutsCol(), workoutId);
    
    // Filtrar valores undefined para evitar errores en Firestore
    const cleanData: Partial<Workout> = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    ) as Partial<Workout>;

    const updateData: Partial<Workout> & { serverUpdatedAt: ReturnType<typeof serverTimestamp> } = {
        ...cleanData,
        updatedAt: now(),
        serverUpdatedAt: serverTimestamp(),
    };

    // Recalcular volumen si se actualizaron los ejercicios
    if (data.ejercicios) {
        updateData.volumen = calcularVolumen(data.ejercicios);
    }

    // Actualizar fechaTimestamp si cambió la fecha
    if (data.fecha) {
        updateData.fechaTimestamp = Timestamp.fromDate(parseLocalDate(data.fecha));
    }

    await updateDoc(ref, updateData);
}

/**
 * Completa un día del workout y avanza al siguiente día
 */
export async function completeDay(
    workoutId: string,
    ejercicios: EjercicioWorkout[],
    diaActual: number,
    totalDias: number,
    duracion?: number,
    calorias?: number
): Promise<{ workoutCompleted: boolean; nextDay?: number }> {
    const volumen = calcularVolumen(ejercicios);
    const esUltimoDia = diaActual >= totalDias;
    const workoutCompleted = esUltimoDia;

    // Calcular duración si no se proporciona y hay inicioTimestamp
    let duracionCalculada = duracion;
    const workout = await getWorkout(workoutId);
    if (!duracionCalculada && workout?.inicioTimestamp) {
        duracionCalculada = calcularDuracion(workout.inicioTimestamp);
    }

    // Preparar datos para actualizar, excluyendo undefined
    const updateData: Partial<Workout> = {
        ejercicios,
        volumen,
        diaActual: workoutCompleted ? diaActual : diaActual + 1,
    };

    if (duracionCalculada !== undefined) {
        updateData.duracion = duracionCalculada;
    }

    if (calorias !== undefined) {
        updateData.calorias = calorias;
    }

    // Guardar el workout del día actual como completado en el calendario
    const fechaHoy = getTodayLocal();
    updateData.completado = true;
    updateData.fecha = fechaHoy;
    // Actualizar fechaTimestamp para que aparezca en el calendario
    updateData.fechaTimestamp = Timestamp.fromDate(parseLocalDate(fechaHoy));
    await updateWorkout(workoutId, updateData);

    if (workoutCompleted) {
        // Rutina completamente terminada
        return { workoutCompleted: true };
    } else {
        // Para el siguiente día, el usuario puede crear un nuevo workout desde el menú
        // No creamos el workout automáticamente, permitimos que el usuario elija cuándo continuar
        return { workoutCompleted: false, nextDay: diaActual + 1 };
    }
}

/**
 * Marca un workout como completado y calcula estadísticas finales
 */
export async function completeWorkout(
    workoutId: string,
    ejercicios: EjercicioWorkout[],
    duracion?: number,
    calorias?: number
): Promise<void> {
    const volumen = calcularVolumen(ejercicios);

    await updateWorkout(workoutId, {
        completado: true,
        ejercicios,
        volumen,
        duracion,
        calorias,
    });
}

/**
 * Obtiene un workout por ID
 */
export async function getWorkout(workoutId: string): Promise<Workout | null> {
    const snap = await getDoc(doc(workoutsCol(), workoutId));
    if (!snap.exists()) return null;

    const data = snap.data() as Workout;
    return { id: snap.id, ...data };
}

/**
 * Obtiene todos los workouts de un usuario
 */
export async function getWorkoutsByUsuario(
    usuarioId: string
): Promise<Array<{ id: string } & Workout>> {
    const q = query(
        workoutsCol(),
        where('usuarioId', '==', usuarioId)
        // Nota: Ordenamos en memoria para evitar necesidad de índice compuesto
    );

    const snap = await getDocs(q);
    const workouts = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Workout) }));
    
    // Ordenar por fechaTimestamp descendente en memoria
    return workouts.sort((a, b) => {
        const fechaA = a.fechaTimestamp?.toMillis() || a.createdAt || 0;
        const fechaB = b.fechaTimestamp?.toMillis() || b.createdAt || 0;
        return fechaB - fechaA;
    });
}

/**
 * Obtiene workouts de un usuario en un rango de fechas
 */
export async function getWorkoutsByDateRange(
    usuarioId: string,
    fechaInicio: string,
    fechaFin: string
): Promise<Array<{ id: string } & Workout>> {
    const inicioTimestamp = Timestamp.fromDate(parseLocalDate(fechaInicio));
    const finTimestamp = Timestamp.fromDate(parseLocalDate(fechaFin + 'T23:59:59'));

    // Nota: Para evitar índices compuestos, primero filtramos por usuarioId
    // y luego filtramos los resultados en memoria por fecha
    const q = query(
        workoutsCol(),
        where('usuarioId', '==', usuarioId)
        // No usamos where en fechaTimestamp aquí para evitar índice compuesto
    );

    const snap = await getDocs(q);
    const allWorkouts = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Workout) }));
    
    // Filtrar por rango de fechas en memoria
    const workouts = allWorkouts.filter((w) => {
        const fecha = w.fechaTimestamp?.toMillis() || w.createdAt || 0;
        const inicio = inicioTimestamp.toMillis();
        const fin = finTimestamp.toMillis();
        return fecha >= inicio && fecha <= fin;
    });
    
    // Ordenar por fechaTimestamp descendente en memoria
    return workouts.sort((a, b) => {
        const fechaA = a.fechaTimestamp?.toMillis() || a.createdAt || 0;
        const fechaB = b.fechaTimestamp?.toMillis() || b.createdAt || 0;
        return fechaB - fechaA;
    });
}

/**
 * Obtiene un workout por fecha específica
 */
export async function getWorkoutByDate(
    usuarioId: string,
    fecha: string
): Promise<Array<{ id: string } & Workout>> {
    const inicioDia = Timestamp.fromDate(parseLocalDate(fecha));
    const finDia = Timestamp.fromDate(parseLocalDate(fecha + 'T23:59:59'));

    // Nota: Para evitar índices compuestos, primero filtramos por usuarioId
    // y luego filtramos los resultados en memoria por fecha
    const q = query(
        workoutsCol(),
        where('usuarioId', '==', usuarioId)
        // No usamos where en fechaTimestamp aquí para evitar índice compuesto
    );

    const snap = await getDocs(q);
    const allWorkouts = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Workout) }));
    
    // Filtrar por rango de fechas en memoria
    const workouts = allWorkouts.filter((w) => {
        const fechaTimestamp = w.fechaTimestamp?.toMillis() || w.createdAt || 0;
        const inicio = inicioDia.toMillis();
        const fin = finDia.toMillis();
        return fechaTimestamp >= inicio && fechaTimestamp <= fin;
    });
    
    // Ordenar por fechaTimestamp descendente en memoria
    return workouts.sort((a, b) => {
        const fechaA = a.fechaTimestamp?.toMillis() || a.createdAt || 0;
        const fechaB = b.fechaTimestamp?.toMillis() || b.createdAt || 0;
        return fechaB - fechaA;
    });
}

/**
 * Obtiene workouts completados de un usuario
 */
export async function getCompletedWorkouts(
    usuarioId: string
): Promise<Array<{ id: string } & Workout>> {
    const q = query(
        workoutsCol(),
        where('usuarioId', '==', usuarioId),
        where('completado', '==', true)
        // Nota: Ordenamos en memoria para evitar necesidad de índice compuesto
    );

    const snap = await getDocs(q);
    const workouts = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Workout) }));
    
    // Ordenar por fechaTimestamp descendente en memoria
    return workouts.sort((a, b) => {
        const fechaA = a.fechaTimestamp?.toMillis() || a.createdAt || 0;
        const fechaB = b.fechaTimestamp?.toMillis() || b.createdAt || 0;
        return fechaB - fechaA;
    });
}

/**
 * Obtiene workouts activos (no completados) de un usuario
 */
export async function getActiveWorkouts(
    usuarioId: string
): Promise<Array<{ id: string } & Workout>> {
    const q = query(
        workoutsCol(),
        where('usuarioId', '==', usuarioId),
        where('completado', '==', false)
        // Nota: Ordenamos en memoria para evitar necesidad de índice compuesto
    );

    const snap = await getDocs(q);
    const workouts = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Workout) }));
    
    // Ordenar por fechaTimestamp descendente en memoria
    return workouts.sort((a, b) => {
        const fechaA = a.fechaTimestamp?.toMillis() || a.createdAt || 0;
        const fechaB = b.fechaTimestamp?.toMillis() || b.createdAt || 0;
        return fechaB - fechaA;
    });
}

/**
 * Obtiene el workout activo más reciente de un usuario
 */
export async function getActiveWorkout(
    usuarioId: string
): Promise<({ id: string } & Workout) | null> {
    const activeWorkouts = await getActiveWorkouts(usuarioId);
    return activeWorkouts.length > 0 ? activeWorkouts[0] : null;
}

/**
 * Obtiene workouts por rutina
 */
export async function getWorkoutsByRutina(
    rutinaId: string,
    usuarioId?: string
): Promise<Array<{ id: string } & Workout>> {
    let q;

    if (usuarioId) {
        // Cuando hay múltiples where, ordenamos en memoria para evitar índice compuesto
        q = query(
            workoutsCol(),
            where('rutinaId', '==', rutinaId),
            where('usuarioId', '==', usuarioId)
        );
    } else {
        q = query(
            workoutsCol(),
            where('rutinaId', '==', rutinaId)
            // Nota: Ordenamos en memoria para evitar necesidad de índice compuesto
        );
    }

    const snap = await getDocs(q);
    const workouts = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Workout) }));
    
    // Ordenar por fechaTimestamp descendente en memoria
    return workouts.sort((a, b) => {
        const fechaA = a.fechaTimestamp?.toMillis() || a.createdAt || 0;
        const fechaB = b.fechaTimestamp?.toMillis() || b.createdAt || 0;
        return fechaB - fechaA;
    });
}

/**
 * Elimina un workout
 */
export async function deleteWorkout(workoutId: string): Promise<void> {
    await deleteDoc(doc(workoutsCol(), workoutId));
}

/* ================== Estadísticas ================== */

/**
 * Calcula estadísticas generales de un usuario
 */
export interface EstadisticasUsuario {
    totalWorkouts: number;
    volumenTotal: number;
    caloriasTotales: number;
    tiempoTotal: number; // minutos
    promedioVolumen: number;
    promedioCalorias: number;
    promedioDuracion: number;
}

export async function getEstadisticasUsuario(
    usuarioId: string,
    fechaInicio?: string,
    fechaFin?: string
): Promise<EstadisticasUsuario> {
    let workouts: Array<{ id: string } & Workout>;

    if (fechaInicio && fechaFin) {
        workouts = await getWorkoutsByDateRange(usuarioId, fechaInicio, fechaFin);
    } else {
        workouts = await getCompletedWorkouts(usuarioId);
    }

    const completados = workouts.filter((w) => w.completado);

    const totalWorkouts = completados.length;
    const volumenTotal = completados.reduce((sum, w) => sum + (w.volumen || 0), 0);
    const caloriasTotales = completados.reduce((sum, w) => sum + (w.calorias || 0), 0);
    const tiempoTotal = completados.reduce((sum, w) => sum + (w.duracion || 0), 0);

    return {
        totalWorkouts,
        volumenTotal,
        caloriasTotales,
        tiempoTotal,
        promedioVolumen: totalWorkouts > 0 ? volumenTotal / totalWorkouts : 0,
        promedioCalorias: totalWorkouts > 0 ? caloriasTotales / totalWorkouts : 0,
        promedioDuracion: totalWorkouts > 0 ? tiempoTotal / totalWorkouts : 0,
    };
}

/* ================== Análisis por Grupo Muscular ================== */

/**
 * Calcula el volumen por grupo muscular desde un workout completado
 * El volumen se distribuye proporcionalmente si un ejercicio trabaja múltiples grupos
 * 
 * @param ejercicios Array de ejercicios con sus series completadas
 * @returns Objeto con volumen total por grupo muscular
 */
export function calcularVolumenPorGrupoMuscular(
    ejercicios: EjercicioWorkout[]
): Record<MuscleGroup, number> {
    // Inicializar todos los grupos musculares en 0
    const volumen: Record<MuscleGroup, number> = {
        Chest: 0,
        Back: 0,
        Shoulders: 0,
        Quads: 0,
        Hamstrings: 0,
        Biceps: 0,
        Triceps: 0,
    };

    ejercicios.forEach((ejercicio) => {
        // Obtener grupos musculares que trabaja este ejercicio
        const grupos = getMuscleGroupsForExercise(ejercicio.nombre);
        
        // Calcular volumen del ejercicio (solo series completadas)
        const volumenEjercicio = ejercicio.series.reduce((sum, serie) => {
            return sum + (serie.done ? serie.weight * serie.reps : 0);
        }, 0);

        // Distribuir volumen entre grupos musculares proporcionalmente
        // Si el ejercicio trabaja múltiples grupos, dividimos el volumen equitativamente
        if (grupos.length > 0 && volumenEjercicio > 0) {
            const volumenPorGrupo = volumenEjercicio / grupos.length;
            grupos.forEach((grupo) => {
                volumen[grupo] += volumenPorGrupo;
            });
        }
        // Si no se encontraron grupos musculares, el volumen se "pierde" (no se asigna a ningún grupo)
        // Esto puede pasar con ejercicios nuevos que aún no están en el mapeo
    });

    return volumen;
}

/**
 * Obtiene volumen por grupo muscular para workouts completados en un rango de fechas
 * 
 * @param usuarioId ID del usuario
 * @param fechaInicio Fecha de inicio (YYYY-MM-DD)
 * @param fechaFin Fecha de fin (YYYY-MM-DD)
 * @returns Objeto con volumen total acumulado por grupo muscular en ese rango
 */
export async function getVolumenPorGrupoMuscularEnRango(
    usuarioId: string,
    fechaInicio: string,
    fechaFin: string
): Promise<Record<MuscleGroup, number>> {
    const workouts = await getWorkoutsByDateRange(usuarioId, fechaInicio, fechaFin);
    const completados = workouts.filter((w) => w.completado && w.ejercicios);

    // Inicializar volumen total por grupo muscular
    const volumenTotal: Record<MuscleGroup, number> = {
        Chest: 0,
        Back: 0,
        Shoulders: 0,
        Quads: 0,
        Hamstrings: 0,
        Biceps: 0,
        Triceps: 0,
    };

    // Acumular volumen de cada workout
    completados.forEach((workout) => {
        if (workout.ejercicios) {
            const volumen = calcularVolumenPorGrupoMuscular(workout.ejercicios);
            Object.keys(volumenTotal).forEach((grupo) => {
                volumenTotal[grupo as MuscleGroup] += volumen[grupo as MuscleGroup];
            });
        }
    });

    return volumenTotal;
}

/**
 * Interface para volumen semanal por grupo muscular
 */
export interface VolumenSemanal {
    fechaInicio: string; // Fecha del lunes de esa semana (YYYY-MM-DD)
    volumen: Record<MuscleGroup, number>;
}

/**
 * Obtiene volumen por grupo muscular agrupado por semana
 * Útil para gráficos de progreso semanal
 * 
 * @param usuarioId ID del usuario
 * @param semanas Número de semanas hacia atrás a partir de hoy (default: 5)
 * @returns Array de objetos con fecha de inicio de semana y volumen por grupo
 */
export async function getVolumenPorSemana(
    usuarioId: string,
    semanas: number = 5
): Promise<VolumenSemanal[]> {
    const hoy = new Date();
    const resultados: VolumenSemanal[] = [];

    // Calcular semanas hacia atrás
    for (let i = semanas - 1; i >= 0; i--) {
        // Calcular lunes de la semana i semanas atrás
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() - (i * 7));
        
        // Ajustar al lunes de esa semana
        const dayOfWeek = fecha.getDay(); // 0 = domingo, 1 = lunes, etc.
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Ajuste para llegar al lunes
        fecha.setDate(fecha.getDate() + diff);
        fecha.setHours(0, 0, 0, 0);

        const lunes = formatLocalDate(fecha);
        
        // Calcular domingo de esa semana
        const domingo = new Date(fecha);
        domingo.setDate(fecha.getDate() + 6);
        domingo.setHours(23, 59, 59, 999);
        const domingoStr = formatLocalDate(domingo);

        // Obtener volumen para esa semana
        const volumen = await getVolumenPorGrupoMuscularEnRango(
            usuarioId,
            lunes,
            domingoStr
        );

        resultados.push({
            fechaInicio: lunes,
            volumen,
        });
    }

    return resultados;
}

/**
 * Calcula el porcentaje de cambio (Rate of Progress - ROP) entre dos valores de volumen
 * 
 * @param volumenActual Volumen de la semana actual
 * @param volumenAnterior Volumen de la semana anterior
 * @returns Porcentaje de cambio (positivo = aumento, negativo = disminución)
 */
export function calcularROP(
    volumenActual: number,
    volumenAnterior: number
): number {
    if (volumenAnterior === 0) {
        return volumenActual > 0 ? 100 : 0; // Si no había volumen anterior, cualquier volumen es 100% de aumento
    }
    return ((volumenActual - volumenAnterior) / volumenAnterior) * 100;
}