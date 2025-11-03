/**
 * Servicio flexible para mapear ejercicios a grupos musculares
 * Diseñado para ser extensible y manejar nuevos ejercicios fácilmente
 */

export type MuscleGroup = 
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Quads"
  | "Hamstrings"
  | "Biceps"
  | "Triceps";

/**
 * Mapeo base de ejercicios conocidos a grupos musculares
 * NOTA: Este es un mapeo extensible. Agrega nuevos ejercicios aquí cuando se necesiten.
 * 
 * Cada ejercicio puede trabajar múltiples grupos musculares (ej: Bench Press trabaja Chest, Triceps, Shoulders)
 */
const exerciseToMuscleGroup: Record<string, MuscleGroup[]> = {
  // ========== CHEST (Pecho) ==========
  "Bench Press": ["Chest", "Triceps", "Shoulders"],
  "Push-ups": ["Chest", "Triceps", "Shoulders"],
  "Push Ups": ["Chest", "Triceps", "Shoulders"],
  "Dumbbell Press": ["Chest", "Triceps", "Shoulders"],
  "Incline Press": ["Chest", "Shoulders"],
  "Decline Press": ["Chest", "Triceps"],
  "Chest Fly": ["Chest"],
  "Dumbbell Fly": ["Chest"],
  "Cable Fly": ["Chest"],
  "Pectoral": ["Chest"],
  
  // ========== BACK (Espalda) ==========
  "Pull-ups": ["Back", "Biceps"],
  "Pull Ups": ["Back", "Biceps"],
  "Lat Pulldown": ["Back", "Biceps"],
  "Barbell Row": ["Back", "Biceps"],
  "Dumbbell Row": ["Back", "Biceps"],
  "T-Bar Row": ["Back", "Biceps"],
  "Seated Row": ["Back", "Biceps"],
  "Cable Row": ["Back", "Biceps"],
  "Deadlift": ["Back", "Hamstrings"],
  "Romanian Deadlift": ["Back", "Hamstrings"],
  "RDL": ["Back", "Hamstrings"],
  "Bent Over Row": ["Back", "Biceps"],
  
  // ========== SHOULDERS (Hombros) ==========
  "Shoulder Press": ["Shoulders", "Triceps"],
  "Overhead Press": ["Shoulders", "Triceps"],
  "OHP": ["Shoulders", "Triceps"],
  "Lateral Raise": ["Shoulders"],
  "Front Raise": ["Shoulders"],
  "Rear Delt Fly": ["Shoulders"],
  "Upright Row": ["Shoulders"],
  "Dumbbell Shoulder Press": ["Shoulders", "Triceps"],
  
  // ========== LEGS - QUADS (Cuádriceps) ==========
  "Squat": ["Quads", "Hamstrings"],
  "Leg Press": ["Quads"],
  "Leg Extension": ["Quads"],
  "Bulgarian Split Squat": ["Quads"],
  "Lunges": ["Quads"],
  "Front Squat": ["Quads"],
  "Back Squat": ["Quads", "Hamstrings"],
  
  // ========== LEGS - HAMSTRINGS (Isquiotibiales) ==========
  "Leg Curl": ["Hamstrings"],
  "Stiff Leg Deadlift": ["Hamstrings"],
  
  // ========== BICEPS ==========
  "Bicep Curl": ["Biceps"],
  "Biceps Curl": ["Biceps"],
  "Hammer Curl": ["Biceps"],
  "Cable Curl": ["Biceps"],
  "Concentration Curl": ["Biceps"],
  "Barbell Curl": ["Biceps"],
  "Dumbbell Curl": ["Biceps"],
  
  // ========== TRICEPS ==========
  "Tricep Extension": ["Triceps"],
  "Triceps Extension": ["Triceps"],
  "Overhead Extension": ["Triceps"],
  "Close Grip Bench": ["Triceps", "Chest"],
  "Dips": ["Triceps", "Chest", "Shoulders"],
  "Tricep Pushdown": ["Triceps"],
  "Triceps Pushdown": ["Triceps"],
  "Cable Pushdown": ["Triceps"],
};

/**
 * Palabras clave para identificar grupos musculares cuando no hay coincidencia exacta
 * Estas palabras se buscan en el nombre del ejercicio
 */
const muscleKeywords: Record<MuscleGroup, string[]> = {
  Chest: ["chest", "pectoral", "bench", "fly", "push", "press"],
  Back: ["back", "lat", "row", "pulldown", "deadlift", "pull"],
  Shoulders: ["shoulder", "deltoid", "lateral", "raise", "overhead", "press"],
  Quads: ["quad", "squat", "leg press", "leg extension", "lunge"],
  Hamstrings: ["hamstring", "leg curl", "romanian", "stiff leg"],
  Biceps: ["bicep", "curl", "pull"],
  Triceps: ["tricep", "extension", "pushdown", "dip", "close grip"],
};

/**
 * Normaliza el nombre del ejercicio para comparación
 * - Convierte a minúsculas
 * - Elimina espacios extra
 * - Elimina caracteres especiales comunes
 */
function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "");
}

/**
 * Busca coincidencia exacta o parcial del nombre del ejercicio
 */
function findExactMatch(exerciseName: string): MuscleGroup[] | null {
  const normalized = normalizeExerciseName(exerciseName);
  
  // Buscar coincidencia exacta (case-insensitive)
  for (const [key, groups] of Object.entries(exerciseToMuscleGroup)) {
    if (normalizeExerciseName(key) === normalized) {
      return groups;
    }
  }
  
  // Buscar si el nombre contiene alguna palabra clave completa
  const nameWords = normalized.split(" ");
  for (const [key, groups] of Object.entries(exerciseToMuscleGroup)) {
    const keyWords = normalizeExerciseName(key).split(" ");
    // Si todas las palabras clave están en el nombre del ejercicio
    if (keyWords.every(word => nameWords.includes(word) || normalized.includes(word))) {
      return groups;
    }
  }
  
  return null;
}

/**
 * Busca grupos musculares basándose en palabras clave en el nombre
 */
function findByKeywords(exerciseName: string): MuscleGroup[] {
  const normalized = normalizeExerciseName(exerciseName);
  const foundGroups: Set<MuscleGroup> = new Set();
  
  // Buscar palabras clave para cada grupo muscular
  for (const [group, keywords] of Object.entries(muscleKeywords)) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        foundGroups.add(group as MuscleGroup);
        break; // Solo agregar una vez por grupo
      }
    }
  }
  
  return Array.from(foundGroups);
}

/**
 * Obtiene los grupos musculares principales para un ejercicio
 * 
 * Estrategia de búsqueda:
 * 1. Busca coincidencia exacta en el mapeo
 * 2. Si no encuentra, busca por palabras clave
 * 3. Si aún no encuentra, retorna array vacío (se puede mejorar agregando lógica adicional)
 * 
 * @param exerciseName Nombre del ejercicio (ej: "Bench Press", "Push-ups", etc.)
 * @returns Array de grupos musculares que trabaja ese ejercicio
 */
export function getMuscleGroupsForExercise(exerciseName: string): MuscleGroup[] {
  if (!exerciseName || exerciseName.trim().length === 0) {
    return [];
  }
  
  // Primero intentar coincidencia exacta o parcial
  const exactMatch = findExactMatch(exerciseName);
  if (exactMatch && exactMatch.length > 0) {
    return exactMatch;
  }
  
  // Si no hay coincidencia exacta, buscar por palabras clave
  const keywordMatch = findByKeywords(exerciseName);
  if (keywordMatch.length > 0) {
    return keywordMatch;
  }
  
  // Si no se encuentra nada, retornar array vacío
  // En el futuro se puede agregar lógica para ejercicios genéricos o consultar una base de datos
  return [];
}

/**
 * Obtiene el grupo muscular principal (el primero) para un ejercicio
 * Útil cuando necesitas solo un grupo muscular primario
 * 
 * @param exerciseName Nombre del ejercicio
 * @returns El grupo muscular principal o null si no se encuentra
 */
export function getPrimaryMuscleGroup(exerciseName: string): MuscleGroup | null {
  const groups = getMuscleGroupsForExercise(exerciseName);
  return groups.length > 0 ? groups[0] : null;
}

/**
 * Obtiene todos los grupos musculares disponibles
 */
export function getAllMuscleGroups(): MuscleGroup[] {
  return ["Chest", "Back", "Shoulders", "Quads", "Hamstrings", "Biceps", "Triceps"];
}

/**
 * Agrega un nuevo ejercicio al mapeo (útil para extender el servicio dinámicamente)
 * NOTA: Esto solo afecta la sesión actual. Para persistencia, agregar al objeto exerciseToMuscleGroup
 */
export function addExerciseMapping(
  exerciseName: string,
  muscleGroups: MuscleGroup[]
): void {
  exerciseToMuscleGroup[exerciseName] = muscleGroups;
}

/**
 * Verifica si un ejercicio ya está en el mapeo
 */
export function isExerciseMapped(exerciseName: string): boolean {
  return findExactMatch(exerciseName) !== null;
}

