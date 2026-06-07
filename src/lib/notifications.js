import { messaging } from "./firebase";
import { getToken, onMessage } from "firebase/messaging";
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Permission denied");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

     if (token) {
  console.log("FCM Token:", token);

  // send to backend
  console.log("Sending token with role:", "user");
  await fetch("/api/save-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
  token,
  role: "user", // TEMP for testing
}),
  });

  return token;
}
     else {
      console.log("No token found");
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

export const listenToMessages = (callback) => {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log("Message received:", payload);

    if (callback) {
      callback(payload);
    }
  });
};