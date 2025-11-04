#!/usr/bin/env node

/**
 * Script para mostrar detalles específicos de documentos en Firestore
 * Demuestra acceso completo a los datos
 * 
 * Uso: npm run script:show-details
 */

import { getFirestore } from './firebase-admin-init';
import * as admin from 'firebase-admin';

async function showDetails(): Promise<void> {
  try {
    const db = getFirestore();
    
    console.log('🔍 Obteniendo detalles de documentos...\n');

    // 1. Mostrar detalles de un usuario
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  👤 DETALLES DE USUARIOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const usersSnapshot = await db.collection('usuarios').limit(2).get();
    let userCount = 0;
    usersSnapshot.forEach((doc) => {
      userCount++;
      const data = doc.data();
      console.log(`Usuario ${userCount}:`);
      console.log(`  ID: ${doc.id}`);
      console.log(`  Email: ${data.email || 'N/A'}`);
      console.log(`  Nombre: ${data.nombre || 'N/A'}`);
      console.log(`  Objetivo: ${data.objetivo || 'N/A'}`);
      console.log(`  Experiencia: ${data.experiencia || 'N/A'}`);
      console.log(`  Workouts/semana: ${data.workoutsPorSemana || 'N/A'}`);
      if (data.createdAt) {
        const createdDate = new Date(data.createdAt);
        console.log(`  Creado: ${createdDate.toLocaleDateString('es-ES')}`);
      }
      console.log('');
    });

    // 2. Mostrar detalles de rutinas
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  💪 DETALLES DE RUTINAS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const routinesSnapshot = await db.collection('rutinas').limit(1).get();
    routinesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`Rutina: ${data.nombre || 'Sin nombre'}`);
      console.log(`  ID: ${doc.id}`);
      console.log(`  Días: ${data.cantidadDias || 'N/A'}`);
      console.log(`  Tiempo: ${data.tiempoAproximado || 'N/A'}`);
      console.log(`  Nivel: ${data.nivelDificultad || 'N/A'}`);
      console.log(`  Descripción: ${(data.descripcion || '').substring(0, 100)}...`);
      console.log('');
    });

    // 3. Mostrar detalles de workouts recientes
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🏋️  DETALLES DE WORKOUTS RECIENTES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const workoutsSnapshot = await db.collection('workouts')
      .orderBy('createdAt', 'desc')
      .limit(3)
      .get();
    
    let workoutCount = 0;
    workoutsSnapshot.forEach((doc) => {
      workoutCount++;
      const data = doc.data();
      console.log(`Workout ${workoutCount}:`);
      console.log(`  ID: ${doc.id}`);
      console.log(`  Usuario: ${data.usuarioId?.substring(0, 12)}...`);
      console.log(`  Rutina: ${data.rutinaId?.substring(0, 12) || 'N/A'}...`);
      console.log(`  Fecha: ${data.fecha || 'N/A'}`);
      console.log(`  Completado: ${data.completado ? '✅ Sí' : '⏳ No'}`);
      console.log(`  Día actual: ${data.diaActual || 'N/A'}`);
      console.log(`  Volumen: ${data.volumen ? data.volumen.toLocaleString('es-ES') + ' kg' : 'N/A'}`);
      console.log(`  Duración: ${data.duracion ? data.duracion + ' min' : 'N/A'}`);
      
      if (data.ejercicios && Array.isArray(data.ejercicios)) {
        console.log(`  Ejercicios: ${data.ejercicios.length}`);
        data.ejercicios.slice(0, 3).forEach((ej: any) => {
          const completedSets = ej.series?.filter((s: any) => s.done).length || 0;
          const totalSets = ej.series?.length || 0;
          console.log(`    - ${ej.nombre}: ${completedSets}/${totalSets} series completadas`);
        });
      }
      console.log('');
    });

    // 4. Estadísticas rápidas
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  📊 ESTADÍSTICAS RÁPIDAS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const allUsers = await db.collection('usuarios').count().get();
    const allRoutines = await db.collection('rutinas').count().get();
    const allWorkouts = await db.collection('workouts').count().get();
    const completedWorkouts = await db.collection('workouts')
      .where('completado', '==', true)
      .count()
      .get();
    
    console.log(`Total usuarios registrados: ${allUsers.data().count}`);
    console.log(`Total rutinas disponibles: ${allRoutines.data().count}`);
    console.log(`Total workouts: ${allWorkouts.data().count}`);
    console.log(`Workouts completados: ${completedWorkouts.data().count}`);
    
    // Calcular volumen total
    const workoutsSnapshot2 = await db.collection('workouts').get();
    let totalVolume = 0;
    workoutsSnapshot2.forEach((doc) => {
      const data = doc.data();
      if (data.volumen) {
        totalVolume += data.volumen;
      }
    });
    
    console.log(`Volumen total acumulado: ${totalVolume.toLocaleString('es-ES')} kg`);
    console.log('\n✅ Conexión a Firebase verificada exitosamente!\n');
    console.log('🎉 Puedo leer y analizar todos tus datos de Firebase.\n');

  } catch (error) {
    console.error('❌ Error al obtener detalles:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  showDetails()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { showDetails };

