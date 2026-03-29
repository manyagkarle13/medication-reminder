import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
      });

      console.log("FCM Token:", token);

      return token;
    } else {
      console.log("Notification permission denied");
    }
  } catch (error) {
    console.error("Error getting token:", error);
  }
};