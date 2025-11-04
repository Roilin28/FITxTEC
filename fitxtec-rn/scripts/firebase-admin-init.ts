/**
 * Inicialización de Firebase Admin SDK para scripts
 * 
 * Este módulo proporciona una conexión inicializada a Firebase
 * para usar en scripts de Node.js
 */

import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

let initialized = false;

/**
 * Inicializa Firebase Admin SDK
 * Busca el archivo de credenciales en ubicaciones comunes
 */
export function initializeFirebaseAdmin(): admin.firestore.Firestore {
  if (initialized && admin.apps.length > 0) {
    return admin.firestore();
  }

  // Rutas posibles donde podría estar el serviceAccountKey.json
  const possiblePaths = [
    path.join(__dirname, '../serviceAccountKey.json'),
    path.join(__dirname, '../../serviceAccountKey.json'),
    'C:/Users/luisu/Downloads/fitxtec-firebase-adminsdk-fbsvc-a197bc1b54.json',
    process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
  ].filter(Boolean);

  let serviceAccountPath: string | null = null;

  // Buscar el archivo de credenciales
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      serviceAccountPath = possiblePath;
      break;
    }
  }

  if (!serviceAccountPath) {
    throw new Error(
      `No se encontró el archivo de credenciales de Firebase.\n` +
      `Busqué en:\n${possiblePaths.map(p => `  - ${p}`).join('\n')}\n\n` +
      `Por favor, asegúrate de que el archivo serviceAccountKey.json esté en una de estas ubicaciones.`
    );
  }

  // Cargar credenciales
  const serviceAccount = JSON.parse(
    fs.readFileSync(serviceAccountPath, 'utf8')
  );

  // Inicializar Firebase Admin
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: 'fitxtec',
    });
  }

  initialized = true;
  console.log(`✓ Firebase Admin inicializado correctamente`);
  console.log(`  Credenciales desde: ${serviceAccountPath}\n`);

  return admin.firestore();
}

/**
 * Obtiene una instancia de Firestore (inicializa si es necesario)
 */
export function getFirestore(): admin.firestore.Firestore {
  return initializeFirebaseAdmin();
}

