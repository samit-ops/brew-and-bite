"use client";

import { useEffect } from "react";
import {
  requestNotificationPermission,
  listenToMessages,
} from "@/lib/notifications";
import { useToast } from "@/context/ToastContext";

export default function NotificationHandler() {
  const { addToast } = useToast();

  useEffect(() => {
    const initNotifications = async () => {
      const token = await requestNotificationPermission();

      if (token) {
        listenToMessages((payload) => {
  console.log("🔥 FRONTEND RECEIVED:", payload);

  const title =
    payload.notification?.title ||
    payload.data?.title ||
    "New Notification";

  const body =
    payload.notification?.body ||
    payload.data?.body ||
    "";

  // Toast
  addToast(title, "info");

  // 🔔 HARD FIX for browser popup
  if (Notification.permission === "granted") {
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        reg.showNotification(title, {
          body,
          icon: "/icon.png",
        });
      }
    });
  }
});
      }
    };

    initNotifications();
  }, [addToast]);

  return null;
}