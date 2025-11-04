#!/usr/bin/env node

/**
 * Script para verificar la estructura de datos en Firestore
 * Verifica que los documentos tengan los campos esperados
 * 
 * Uso: npm run script:check-structure
 */

import { getFirestore } from './firebase-admin-init';

interface StructureCheck {
  collection: string;
  totalDocuments: number;
  validDocuments: number;
  invalidDocuments: number;
  missingFields: Record<string, number>;
  sampleDocument?: any;
}

async function checkDataStructure(): Promise<any> {
  try {
    const db = getFirestore();
    
    console.log('🔍 Verificando estructura de datos en Firestore...\n');

    const collections = await db.listCollections();
    const results: StructureCheck[] = [];

    // Definir campos esperados por colección
    const expectedFields: Record<string, string[]> = {
      usuarios: ['email', 'contrasenna'],
      rutinas: ['nombre', 'cantidadDias', 'tiempoAproximado', 'nivelDificultad'],
      workouts: ['usuarioId', 'fecha', 'completado'],
    };

    for (const collection of collections) {
      const collectionName = collection.id;
      const snapshot = await collection.limit(100).get(); // Limitar a 100 para no sobrecargar

      if (snapshot.empty) {
        console.log(`⚠️  Colección '${collectionName}' está vacía\n`);
        continue;
      }

      const check: StructureCheck = {
        collection: collectionName,
        totalDocuments: snapshot.size,
        validDocuments: 0,
        invalidDocuments: 0,
        missingFields: {},
      };

      const requiredFields = expectedFields[collectionName] || [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        let isValid = true;

        // Verificar campos requeridos
        for (const field of requiredFields) {
          if (!(field in data) || data[field] === undefined || data[field] === null) {
            isValid = false;
            check.missingFields[field] = (check.missingFields[field] || 0) + 1;
          }
        }

        if (isValid) {
          check.validDocuments++;
          // Guardar un documento de ejemplo
          if (!check.sampleDocument) {
            check.sampleDocument = {
              id: doc.id,
              ...data,
            };
          }
        } else {
          check.invalidDocuments++;
        }
      });

      results.push(check);
    }

    // Mostrar resultados
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  VERIFICACIÓN DE ESTRUCTURA DE DATOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    results.forEach((result) => {
      console.log(`📁 Colección: ${result.collection}`);
      console.log(`   Total documentos: ${result.totalDocuments}`);
      console.log(`   ✅ Válidos: ${result.validDocuments}`);
      console.log(`   ❌ Inválidos: ${result.invalidDocuments}`);

      if (Object.keys(result.missingFields).length > 0) {
        console.log(`   ⚠️  Campos faltantes:`);
        Object.entries(result.missingFields).forEach(([field, count]) => {
          console.log(`      - ${field}: falta en ${count} documentos`);
        });
      }

      if (result.sampleDocument) {
        console.log(`\n   📄 Ejemplo de documento:`);
        const sample = { ...result.sampleDocument };
        delete sample.id;
        console.log(`      ID: ${result.sampleDocument.id}`);
        console.log(`      Campos: ${Object.keys(sample).join(', ')}`);
      }

      console.log('');
    });

    console.log('✅ Verificación completada\n');

    return;
  } catch (error) {
    console.error('❌ Error al verificar estructura:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  checkDataStructure()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { checkDataStructure };

