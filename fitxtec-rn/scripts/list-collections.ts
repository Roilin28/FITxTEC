#!/usr/bin/env node

/**
 * Script para listar todas las colecciones de Firestore
 * y contar documentos en cada una
 * 
 * Uso: npm run script:list-collections
 *   o: npx ts-node scripts/list-collections.ts
 */

import { getFirestore } from './firebase-admin-init';

interface CollectionInfo {
  id: string;
  documentCount: number;
}

async function listCollections(): Promise<any> {
  try {
    const db = getFirestore();
    
    console.log('🔍 Buscando colecciones en Firestore...\n');

    // Obtener todas las colecciones
    const collections = await db.listCollections();
    
    if (collections.length === 0) {
      console.log('⚠️  No se encontraron colecciones en Firestore.');
      return;
    }

    console.log(`📊 Encontradas ${collections.length} colecciones:\n`);

    const collectionInfo: CollectionInfo[] = [];

    // Contar documentos en cada colección
    for (const collection of collections) {
      try {
        const snapshot = await collection.count().get();
        const count = snapshot.data().count;
        
        collectionInfo.push({
          id: collection.id,
          documentCount: count,
        });
      } catch (error) {
        console.error(`Error al contar documentos en ${collection.id}:`, error);
        collectionInfo.push({
          id: collection.id,
          documentCount: -1, // Error
        });
      }
    }

    // Mostrar resultados
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  COLECCIÓN                    │  DOCUMENTOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    collectionInfo.forEach((info) => {
      const name = info.id.padEnd(30);
      const count = info.documentCount === -1 
        ? 'ERROR' 
        : info.documentCount.toString().padStart(10);
      console.log(`  ${name} │ ${count}`);
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const totalDocs = collectionInfo.reduce(
      (sum, info) => sum + (info.documentCount > 0 ? info.documentCount : 0),
      0
    );
    
    console.log(`\n📈 Total de documentos: ${totalDocs}`);
    console.log(`\n✅ Listado completado\n`);

    // Exportar resultado como JSON para uso posterior
    const result = {
      timestamp: new Date().toISOString(),
      totalCollections: collections.length,
      totalDocuments: totalDocs,
      collections: collectionInfo,
    };

    return result;
  } catch (error) {
    console.error('❌ Error al listar colecciones:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  listCollections()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { listCollections };

