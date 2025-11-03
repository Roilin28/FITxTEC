#!/usr/bin/env node

/**
 * Script para analizar workouts completados
 * Muestra estadísticas de entrenamientos, volumen, fechas, etc.
 * 
 * Uso: npm run script:analyze-workouts
 */

import { getFirestore } from './firebase-admin-init';
import * as admin from 'firebase-admin';

interface WorkoutStats {
  totalWorkouts: number;
  completedWorkouts: number;
  activeWorkouts: number;
  totalVolume: number;
  averageVolume: number;
  workoutsByMonth: Record<string, number>;
  workoutsByUser: Record<string, number>;
  latestWorkout?: string;
  oldestWorkout?: string;
}

async function analyzeWorkouts(): Promise<any> {
  try {
    const db = getFirestore();
    
    console.log('🏋️  Analizando workouts en Firestore...\n');

    const workoutsRef = db.collection('workouts');
    const snapshot = await workoutsRef.get();

    if (snapshot.empty) {
      console.log('⚠️  No se encontraron workouts en Firestore.');
      return;
    }

    const stats: WorkoutStats = {
      totalWorkouts: snapshot.size,
      completedWorkouts: 0,
      activeWorkouts: 0,
      totalVolume: 0,
      averageVolume: 0,
      workoutsByMonth: {},
      workoutsByUser: {},
    };

    const workoutDates: Date[] = [];

    // Procesar cada workout
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Contar completados vs activos
      if (data.completado) {
        stats.completedWorkouts++;
      } else {
        stats.activeWorkouts++;
      }

      // Sumar volumen
      if (data.volumen) {
        stats.totalVolume += data.volumen;
      }

      // Agrupar por usuario
      if (data.usuarioId) {
        stats.workoutsByUser[data.usuarioId] = 
          (stats.workoutsByUser[data.usuarioId] || 0) + 1;
      }

      // Agrupar por mes
      let date: Date;
      if (data.fechaTimestamp) {
        date = (data.fechaTimestamp as admin.firestore.Timestamp).toDate();
      } else if (data.fecha) {
        date = new Date(data.fecha);
      } else if (data.createdAt) {
        date = new Date(data.createdAt);
      } else {
        return; // Skip si no hay fecha
      }

      workoutDates.push(date);
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      stats.workoutsByMonth[monthKey] = 
        (stats.workoutsByMonth[monthKey] || 0) + 1;
    });

    // Calcular promedio de volumen
    if (stats.completedWorkouts > 0) {
      stats.averageVolume = stats.totalVolume / stats.completedWorkouts;
    }

    // Encontrar fechas extremas
    if (workoutDates.length > 0) {
      workoutDates.sort((a, b) => a.getTime() - b.getTime());
      stats.oldestWorkout = workoutDates[0].toISOString().split('T')[0];
      stats.latestWorkout = workoutDates[workoutDates.length - 1].toISOString().split('T')[0];
    }

    // Mostrar resultados
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ESTADÍSTICAS DE WORKOUTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`📊 Total de workouts:      ${stats.totalWorkouts}`);
    console.log(`✅ Completados:            ${stats.completedWorkouts}`);
    console.log(`🔄 Activos:                ${stats.activeWorkouts}`);
    console.log(`💪 Volumen total:         ${stats.totalVolume.toLocaleString('es-ES')} kg`);
    console.log(`📈 Volumen promedio:       ${stats.averageVolume.toFixed(2)} kg`);
    
    if (stats.oldestWorkout && stats.latestWorkout) {
      console.log(`📅 Workout más antiguo:    ${stats.oldestWorkout}`);
      console.log(`📅 Workout más reciente:    ${stats.latestWorkout}`);
    }
    
    console.log('\n📅 Workouts por mes:');
    const sortedMonths = Object.keys(stats.workoutsByMonth).sort();
    sortedMonths.forEach((month) => {
      console.log(`   ${month}: ${stats.workoutsByMonth[month]} workouts`);
    });

    console.log(`\n👥 Workouts por usuario: ${Object.keys(stats.workoutsByUser).length} usuarios`);
    const topUsers = Object.entries(stats.workoutsByUser)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    topUsers.forEach(([userId, count]) => {
      const shortId = userId.substring(0, 8) + '...';
      console.log(`   ${shortId}: ${count} workouts`);
    });

    console.log('\n✅ Análisis completado\n');

    return stats;
  } catch (error) {
    console.error('❌ Error al analizar workouts:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  analyzeWorkouts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { analyzeWorkouts };

