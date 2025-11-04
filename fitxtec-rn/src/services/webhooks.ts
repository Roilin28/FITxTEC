/**
 * Servicio para enviar webhooks a Zapier para notificaciones
 */

// URLs de webhooks de Zapier
const WEBHOOK_URLS = {
  welcome: "https://hooks.zapier.com/hooks/catch/25224730/usotvwu/",
  login: "https://hooks.zapier.com/hooks/catch/25224730/usotvwu/", // Puedes usar el mismo o crear uno diferente
  workoutCompleted: "https://hooks.zapier.com/hooks/catch/25224730/usotvwu/", // Puedes usar el mismo o crear uno diferente
  routineCompleted: "https://hooks.zapier.com/hooks/catch/25224730/usotvwu/", // Puedes usar el mismo o crear uno diferente
};

/**
 * Envía un webhook a Zapier con los datos proporcionados
 */
async function sendWebhook(
  url: string,
  data: Record<string, any>
): Promise<void> {
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error) {
    // No bloqueamos el flujo si falla el webhook
    console.warn("Error al enviar webhook:", error);
  }
}

/**
 * Envía notificación de correo de bienvenida
 */
export async function sendWelcomeEmail(name: string, email: string): Promise<void> {
  await sendWebhook(WEBHOOK_URLS.welcome, {
    type: "welcome",
    name,
    email,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Envía notificación de login exitoso
 */
export async function sendLoginNotification(
  name: string,
  email: string,
  loginMethod?: "email" | "google" | "apple"
): Promise<void> {
  await sendWebhook(WEBHOOK_URLS.login, {
    type: "login",
    name,
    email,
    loginMethod: loginMethod || "email",
    timestamp: new Date().toISOString(),
  });
}

/**
 * Envía notificación de workout completado
 */
export async function sendWorkoutCompletedNotification(
  name: string,
  email: string,
  workoutData: {
    workoutId: string;
    duration?: number;
    volume?: number;
    exercises?: number;
    calories?: number;
  }
): Promise<void> {
  await sendWebhook(WEBHOOK_URLS.workoutCompleted, {
    type: "workout_completed",
    name,
    email,
    workoutId: workoutData.workoutId,
    duration: workoutData.duration,
    volume: workoutData.volume,
    exercises: workoutData.exercises,
    calories: workoutData.calories,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Envía notificación de rutina completada
 */
export async function sendRoutineCompletedNotification(
  name: string,
  email: string,
  routineData: {
    routineId: string;
    routineName: string;
    totalDays: number;
    totalWorkouts: number;
  }
): Promise<void> {
  await sendWebhook(WEBHOOK_URLS.routineCompleted, {
    type: "routine_completed",
    name,
    email,
    routineId: routineData.routineId,
    routineName: routineData.routineName,
    totalDays: routineData.totalDays,
    totalWorkouts: routineData.totalWorkouts,
    timestamp: new Date().toISOString(),
  });
}

