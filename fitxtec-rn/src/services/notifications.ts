import * as Notifications from "expo-notifications";


export async function local_Notification_Finish_Workout() {
  // 🔹 Configurar el comportamiento cuando la notificación se muestra
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // 🔹 Programar notificación local
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🏋️ FITxTEC",
      body: "Terminaste tu rutina diaria💪",
      data: { screen: "Workout" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 7, // 1900 segundos = 31.6 minutos
    },
  });

  console.log("✅ Notificación local programada (7 segundos)");
}


export async function local_Notification_Start_Workout() {
  // 🔹 Configurar el comportamiento cuando la notificación se muestra
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // 🔹 Programar notificación local
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🏋️ FITxTEC",
      body: "Empezaste tu rutina diaria💪",
      data: { screen: "Workout" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 7, // 1900 segundos = 31.6 minutos
    },
  });

  console.log("✅ Notificación local programada (7 segundos)");
}