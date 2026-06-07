importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

// 🔥 REQUIRED — initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyCizxKQYu9bNPwPd0No4Kta4PkuZrTTyMY",
  authDomain: "brew-and-bite-e996f.firebaseapp.com",
  projectId: "brew-and-bite-e996f",
  storageBucket: "brew-and-bite-e996f.firebasestorage.app",
  messagingSenderId: "572275069908",
  appId: "1:572275069908:web:a40895a316e06989123c41",
});

const messaging = firebase.messaging();

// 🔔 background notifications
messaging.onBackgroundMessage((payload) => {
  console.log("SW received:", payload);

  self.registration.showNotification(
    payload.notification?.title || "New Notification",
    {
      body: payload.notification?.body || "You have an update",
      icon: "/icon.png",
    }
  );
});