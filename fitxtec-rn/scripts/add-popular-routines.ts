#!/usr/bin/env node

/**
 * Script para agregar rutinas populares y famosas a Firebase
 * Todas siguen la misma estructura que las rutinas existentes
 * 
 * Uso: npm run script:add-routines
 */

import { getFirestore } from './firebase-admin-init';
import * as admin from 'firebase-admin';

interface EjercicioDia {
  nombre: string;
  series: number;
}

interface DiaRutina {
  nombre: string;
  ejercicios: EjercicioDia[];
}

interface RutinaData {
  nombre: string;
  cantidadDias: number;
  tiempoAproximado: string;
  nivelDificultad: 'Beginner' | 'Intermediate' | 'Advanced';
  descripcion: string;
  notas?: string;
  dias: DiaRutina[];
}

// Rutinas populares a agregar
const rutinasPopulares: RutinaData[] = [
  {
    nombre: 'Push-Pull-Legs (PPL)',
    cantidadDias: 6,
    tiempoAproximado: '60-90 min',
    nivelDificultad: 'Intermediate',
    descripcion: 'Rutina dividida en 6 días que separa ejercicios de empuje (Push), tirón (Pull) y piernas (Legs). Ideal para hipertrofia y permitir suficiente recuperación entre grupos musculares.',
    notas: 'Descansa 1 día entre cada ciclo (ej: Lunes-Martes-Miércoles, Viernes-Sábado-Domingo)',
    dias: [
      {
        nombre: 'Push Day 1',
        ejercicios: [
          { nombre: 'Bench Press', series: 4 },
          { nombre: 'Overhead Press', series: 3 },
          { nombre: 'Incline Dumbbell Press', series: 3 },
          { nombre: 'Lateral Raise', series: 3 },
          { nombre: 'Tricep Extension', series: 3 },
          { nombre: 'Tricep Pushdown', series: 3 },
        ],
      },
      {
        nombre: 'Pull Day 1',
        ejercicios: [
          { nombre: 'Deadlift', series: 4 },
          { nombre: 'Pull-ups', series: 4 },
          { nombre: 'Barbell Row', series: 3 },
          { nombre: 'Seated Row', series: 3 },
          { nombre: 'Bicep Curl', series: 3 },
          { nombre: 'Hammer Curl', series: 3 },
        ],
      },
      {
        nombre: 'Legs Day 1',
        ejercicios: [
          { nombre: 'Squat', series: 4 },
          { nombre: 'Leg Press', series: 3 },
          { nombre: 'Leg Extension', series: 3 },
          { nombre: 'Leg Curl', series: 3 },
          { nombre: 'Romanian Deadlift', series: 3 },
          { nombre: 'Calf Raise', series: 4 },
        ],
      },
      {
        nombre: 'Push Day 2',
        ejercicios: [
          { nombre: 'Dumbbell Press', series: 4 },
          { nombre: 'Shoulder Press', series: 3 },
          { nombre: 'Cable Fly', series: 3 },
          { nombre: 'Front Raise', series: 3 },
          { nombre: 'Close Grip Bench', series: 3 },
          { nombre: 'Overhead Extension', series: 3 },
        ],
      },
      {
        nombre: 'Pull Day 2',
        ejercicios: [
          { nombre: 'Lat Pulldown', series: 4 },
          { nombre: 'T-Bar Row', series: 3 },
          { nombre: 'Cable Row', series: 3 },
          { nombre: 'Rear Delt Fly', series: 3 },
          { nombre: 'Cable Curl', series: 3 },
          { nombre: 'Concentration Curl', series: 3 },
        ],
      },
      {
        nombre: 'Legs Day 2',
        ejercicios: [
          { nombre: 'Front Squat', series: 4 },
          { nombre: 'Bulgarian Split Squat', series: 3 },
          { nombre: 'Lunges', series: 3 },
          { nombre: 'Stiff Leg Deadlift', series: 3 },
          { nombre: 'Leg Curl', series: 3 },
          { nombre: 'Calf Raise', series: 4 },
        ],
      },
    ],
  },
  {
    nombre: 'StrongLifts 5x5',
    cantidadDias: 3,
    tiempoAproximado: '45-60 min',
    nivelDificultad: 'Beginner',
    descripcion: 'Rutina de fuerza basada en 5 ejercicios compuestos realizados en 5 series de 5 repeticiones. Perfecta para principiantes que buscan desarrollar fuerza base.',
    notas: 'Alterna entre Workout A y Workout B. Descansa 1 día entre entrenamientos. Aumenta el peso cada sesión si completas las 5 series.',
    dias: [
      {
        nombre: 'Workout A',
        ejercicios: [
          { nombre: 'Squat', series: 5 },
          { nombre: 'Bench Press', series: 5 },
          { nombre: 'Barbell Row', series: 5 },
        ],
      },
      {
        nombre: 'Workout B',
        ejercicios: [
          { nombre: 'Squat', series: 5 },
          { nombre: 'Overhead Press', series: 5 },
          { nombre: 'Deadlift', series: 1 },
        ],
      },
      {
        nombre: 'Descanso',
        ejercicios: [],
      },
    ],
  },
  {
    nombre: 'Full Body (Principiante)',
    cantidadDias: 3,
    tiempoAproximado: '45-60 min',
    nivelDificultad: 'Beginner',
    descripcion: 'Rutina de cuerpo completo ideal para principiantes. Trabajas todos los grupos musculares en cada sesión, permitiendo máxima frecuencia de estímulo.',
    notas: 'Descansa al menos 1 día entre sesiones. Perfecta para los primeros 2-3 meses de entrenamiento.',
    dias: [
      {
        nombre: 'Full Body Day 1',
        ejercicios: [
          { nombre: 'Squat', series: 3 },
          { nombre: 'Bench Press', series: 3 },
          { nombre: 'Barbell Row', series: 3 },
          { nombre: 'Overhead Press', series: 3 },
          { nombre: 'Bicep Curl', series: 2 },
          { nombre: 'Tricep Extension', series: 2 },
        ],
      },
      {
        nombre: 'Full Body Day 2',
        ejercicios: [
          { nombre: 'Deadlift', series: 3 },
          { nombre: 'Leg Press', series: 3 },
          { nombre: 'Pull-ups', series: 3 },
          { nombre: 'Dumbbell Press', series: 3 },
          { nombre: 'Lateral Raise', series: 2 },
          { nombre: 'Leg Curl', series: 2 },
        ],
      },
      {
        nombre: 'Full Body Day 3',
        ejercicios: [
          { nombre: 'Squat', series: 3 },
          { nombre: 'Incline Press', series: 3 },
          { nombre: 'Seated Row', series: 3 },
          { nombre: 'Shoulder Press', series: 3 },
          { nombre: 'Hammer Curl', series: 2 },
          { nombre: 'Tricep Pushdown', series: 2 },
        ],
      },
    ],
  },
  {
    nombre: 'Upper/Lower Split',
    cantidadDias: 4,
    tiempoAproximado: '60-75 min',
    nivelDificultad: 'Intermediate',
    descripcion: 'División clásica en tren superior e inferior. Permite entrenar cada grupo muscular 2 veces por semana con buen volumen y recuperación.',
    notas: 'Ejemplo: Lunes-Upper, Martes-Lower, Miércoles-Descanso, Jueves-Upper, Viernes-Lower',
    dias: [
      {
        nombre: 'Upper Body 1',
        ejercicios: [
          { nombre: 'Bench Press', series: 4 },
          { nombre: 'Pull-ups', series: 4 },
          { nombre: 'Overhead Press', series: 3 },
          { nombre: 'Barbell Row', series: 3 },
          { nombre: 'Lateral Raise', series: 3 },
          { nombre: 'Bicep Curl', series: 3 },
          { nombre: 'Tricep Extension', series: 3 },
        ],
      },
      {
        nombre: 'Lower Body 1',
        ejercicios: [
          { nombre: 'Squat', series: 4 },
          { nombre: 'Romanian Deadlift', series: 3 },
          { nombre: 'Leg Press', series: 3 },
          { nombre: 'Leg Extension', series: 3 },
          { nombre: 'Leg Curl', series: 3 },
          { nombre: 'Calf Raise', series: 4 },
        ],
      },
      {
        nombre: 'Upper Body 2',
        ejercicios: [
          { nombre: 'Incline Press', series: 4 },
          { nombre: 'Lat Pulldown', series: 4 },
          { nombre: 'Shoulder Press', series: 3 },
          { nombre: 'Seated Row', series: 3 },
          { nombre: 'Front Raise', series: 3 },
          { nombre: 'Hammer Curl', series: 3 },
          { nombre: 'Close Grip Bench', series: 3 },
        ],
      },
      {
        nombre: 'Lower Body 2',
        ejercicios: [
          { nombre: 'Deadlift', series: 4 },
          { nombre: 'Front Squat', series: 3 },
          { nombre: 'Bulgarian Split Squat', series: 3 },
          { nombre: 'Leg Curl', series: 3 },
          { nombre: 'Lunges', series: 3 },
          { nombre: 'Calf Raise', series: 4 },
        ],
      },
    ],
  },
  {
    nombre: 'Arnold Split',
    cantidadDias: 6,
    tiempoAproximado: '75-90 min',
    nivelDificultad: 'Advanced',
    descripcion: 'Rutina popularizada por Arnold Schwarzenegger. Alta frecuencia de entrenamiento enfocada en hipertrofia máxima. Requiere experiencia y buena recuperación.',
    notas: 'Solo 1 día de descanso (usualmente Domingo). Alta intensidad y volumen. Ideal para culturismo.',
    dias: [
      {
        nombre: 'Chest & Back',
        ejercicios: [
          { nombre: 'Bench Press', series: 4 },
          { nombre: 'Incline Press', series: 4 },
          { nombre: 'Cable Fly', series: 3 },
          { nombre: 'Pull-ups', series: 4 },
          { nombre: 'Barbell Row', series: 4 },
          { nombre: 'T-Bar Row', series: 3 },
          { nombre: 'Deadlift', series: 3 },
        ],
      },
      {
        nombre: 'Shoulders & Arms',
        ejercicios: [
          { nombre: 'Overhead Press', series: 4 },
          { nombre: 'Lateral Raise', series: 4 },
          { nombre: 'Front Raise', series: 3 },
          { nombre: 'Bicep Curl', series: 4 },
          { nombre: 'Hammer Curl', series: 3 },
          { nombre: 'Tricep Extension', series: 4 },
          { nombre: 'Close Grip Bench', series: 3 },
        ],
      },
      {
        nombre: 'Legs',
        ejercicios: [
          { nombre: 'Squat', series: 5 },
          { nombre: 'Leg Press', series: 4 },
          { nombre: 'Leg Extension', series: 4 },
          { nombre: 'Leg Curl', series: 4 },
          { nombre: 'Romanian Deadlift', series: 3 },
          { nombre: 'Calf Raise', series: 5 },
        ],
      },
      {
        nombre: 'Chest & Back',
        ejercicios: [
          { nombre: 'Dumbbell Press', series: 4 },
          { nombre: 'Decline Press', series: 4 },
          { nombre: 'Chest Fly', series: 3 },
          { nombre: 'Lat Pulldown', series: 4 },
          { nombre: 'Seated Row', series: 4 },
          { nombre: 'Cable Row', series: 3 },
        ],
      },
      {
        nombre: 'Shoulders & Arms',
        ejercicios: [
          { nombre: 'Shoulder Press', series: 4 },
          { nombre: 'Rear Delt Fly', series: 4 },
          { nombre: 'Upright Row', series: 3 },
          { nombre: 'Cable Curl', series: 4 },
          { nombre: 'Concentration Curl', series: 3 },
          { nombre: 'Tricep Pushdown', series: 4 },
          { nombre: 'Overhead Extension', series: 3 },
        ],
      },
      {
        nombre: 'Legs',
        ejercicios: [
          { nombre: 'Front Squat', series: 4 },
          { nombre: 'Bulgarian Split Squat', series: 4 },
          { nombre: 'Leg Extension', series: 3 },
          { nombre: 'Leg Curl', series: 3 },
          { nombre: 'Lunges', series: 3 },
          { nombre: 'Calf Raise', series: 5 },
        ],
      },
    ],
  },
  {
    nombre: 'German Volume Training (GVT)',
    cantidadDias: 4,
    tiempoAproximado: '60-75 min',
    nivelDificultad: 'Advanced',
    descripcion: 'Método alemán de volumen enfocado en hipertrofia máxima. 10 series de 10 repeticiones por ejercicio. Ideal para romper mesetas.',
    notas: 'Muy intensa. Úsala por 4-6 semanas máximo. Descansa 60-90 segundos entre series.',
    dias: [
      {
        nombre: 'Chest & Back',
        ejercicios: [
          { nombre: 'Bench Press', series: 10 },
          { nombre: 'Barbell Row', series: 10 },
        ],
      },
      {
        nombre: 'Legs & Abs',
        ejercicios: [
          { nombre: 'Squat', series: 10 },
          { nombre: 'Leg Curl', series: 10 },
        ],
      },
      {
        nombre: 'Rest Day',
        ejercicios: [],
      },
      {
        nombre: 'Arms & Shoulders',
        ejercicios: [
          { nombre: 'Bicep Curl', series: 10 },
          { nombre: 'Overhead Press', series: 10 },
        ],
      },
    ],
  },
];

async function addRoutines(): Promise<void> {
  try {
    const db = getFirestore();
    
    console.log('🏋️  Agregando rutinas populares a Firebase...\n');

    let addedCount = 0;
    let skippedCount = 0;

    for (const rutinaData of rutinasPopulares) {
      try {
        // Verificar si la rutina ya existe (por nombre)
        const existingQuery = await db.collection('rutinas')
          .where('nombre', '==', rutinaData.nombre)
          .limit(1)
          .get();

        if (!existingQuery.empty) {
          console.log(`⏭️  Saltando "${rutinaData.nombre}" (ya existe)`);
          skippedCount++;
          continue;
        }

        // Crear el documento de la rutina
        const now = Date.now();
        const rutinaDoc = {
          nombre: rutinaData.nombre,
          cantidadDias: rutinaData.cantidadDias,
          tiempoAproximado: rutinaData.tiempoAproximado,
          nivelDificultad: rutinaData.nivelDificultad,
          descripcion: rutinaData.descripcion,
          notas: rutinaData.notas || null,
          createdAt: now,
          updatedAt: now,
          serverUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const rutinaRef = await db.collection('rutinas').add(rutinaDoc);
        const rutinaId = rutinaRef.id;

        console.log(`✅ Creando rutina: ${rutinaData.nombre} (ID: ${rutinaId})`);

        // Agregar días de la rutina
        for (let i = 0; i < rutinaData.dias.length; i++) {
          const dia = rutinaData.dias[i];
          const diaId = String(i + 1); // "1", "2", "3", etc.

          const diaRef = db.collection(`rutinas/${rutinaId}/dias`).doc(diaId);
          await diaRef.set({
            nombre: dia.nombre,
          });

          // Agregar ejercicios del día
          if (dia.ejercicios.length > 0) {
            const ejerciciosBatch: Promise<any>[] = [];

            dia.ejercicios.forEach((ejercicio, ejIndex) => {
              const ejercicioId = String(ejIndex + 1); // "1", "2", "3", etc.
              const ejercicioRef = db
                .collection(`rutinas/${rutinaId}/dias/${diaId}/ejercicios`)
                .doc(ejercicioId);

              ejerciciosBatch.push(
                ejercicioRef.set({
                  nombre: ejercicio.nombre,
                  series: ejercicio.series,
                })
              );
            });

            await Promise.all(ejerciciosBatch);
            console.log(`   └─ Día ${i + 1}: ${dia.nombre} (${dia.ejercicios.length} ejercicios)`);
          } else {
            console.log(`   └─ Día ${i + 1}: ${dia.nombre} (día de descanso)`);
          }
        }

        addedCount++;
        console.log('');
      } catch (error) {
        console.error(`❌ Error al agregar "${rutinaData.nombre}":`, error);
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMEN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Rutinas agregadas: ${addedCount}`);
    console.log(`⏭️  Rutinas omitidas (ya existen): ${skippedCount}`);
    console.log(`📈 Total procesadas: ${rutinasPopulares.length}`);
    console.log('\n✅ Proceso completado!\n');

  } catch (error) {
    console.error('❌ Error general:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  addRoutines()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { addRoutines };

