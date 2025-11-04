# Scripts de Firebase Admin

Scripts para interactuar con Firebase Firestore desde la línea de comandos usando Firebase Admin SDK.

## 📋 Requisitos Previos

1. **Archivo de credenciales**: Necesitas el archivo `serviceAccountKey.json` descargado desde Firebase Console.
   - Ubicaciones donde se buscará automáticamente:
     - `scripts/serviceAccountKey.json`
     - `serviceAccountKey.json` (raíz del proyecto)
     - `C:/Users/luisu/Downloads/fitxtec-firebase-adminsdk-fbsvc-a197bc1b54.json`
     - Variable de entorno `GOOGLE_APPLICATION_CREDENTIALS`

2. **Dependencias instaladas**: 
   ```bash
   npm install
   ```

## 🚀 Scripts Disponibles

### 1. Listar Colecciones

Lista todas las colecciones de Firestore y cuenta los documentos en cada una.

```bash
npm run script:list-collections
```

**Salida:**
- Lista de colecciones con conteo de documentos
- Total de documentos

### 2. Analizar Workouts

Analiza los workouts completados y muestra estadísticas detalladas.

```bash
npm run script:analyze-workouts
```

**Salida:**
- Total de workouts (completados y activos)
- Volumen total y promedio
- Distribución por mes
- Top usuarios por número de workouts

### 3. Verificar Estructura de Datos

Verifica que los documentos tengan los campos requeridos según el esquema esperado.

```bash
npm run script:check-structure
```

**Salida:**
- Documentos válidos vs inválidos
- Campos faltantes por colección
- Ejemplos de documentos

## 📝 Crear Nuevos Scripts

Para crear un nuevo script:

1. Crea un archivo en `scripts/` (ej: `scripts/mi-script.ts`)
2. Importa el módulo de inicialización:

```typescript
import { getFirestore } from './firebase-admin-init';

async function miScript() {
  const db = getFirestore();
  // Tu código aquí
}

if (require.main === module) {
  miScript()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
```

3. Agrega el script a `package.json`:

```json
"scripts": {
  "script:mi-script": "ts-node scripts/mi-script.ts"
}
```

## 🔒 Seguridad

**IMPORTANTE**: 
- ❌ **NUNCA** subas el archivo `serviceAccountKey.json` a GitHub
- ✅ Está incluido en `.gitignore`
- ✅ Solo úsalo localmente para scripts de desarrollo

## 🛠️ Troubleshooting

### Error: "No se encontró el archivo de credenciales"
- Verifica que el archivo existe en una de las ubicaciones esperadas
- O configura la variable de entorno `GOOGLE_APPLICATION_CREDENTIALS`

### Error de permisos
- Asegúrate de que el Service Account tenga permisos de lectura en Firestore
- Verifica en Firebase Console → IAM & Admin

### Error de TypeScript
- Ejecuta `npm install` para asegurar que todas las dependencias están instaladas
- Verifica que `ts-node` está en `devDependencies`

## 📊 Ejemplos de Uso

### Integración con Cursor AI

Puedes ejecutar estos scripts y compartir los resultados con Cursor AI para análisis:

```bash
npm run script:list-collections > output.json
npm run script:analyze-workouts > workouts-analysis.json
```

Luego puedes decirme: "Analiza el output.json" y podré leer los resultados.

## 🔗 Referencias

- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [Firestore Admin API](https://firebase.google.com/docs/firestore/reference/admin)

