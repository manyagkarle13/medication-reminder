importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDcBN7MHZW7z4HDqvJ8b12TBTg0wS2D888",
  authDomain: "medremind-notifications.firebaseapp.com",
  projectId: "medremind-notifications",
  storageBucket: "medremind-notifications.firebasestorage.app",
  messagingSenderId: "345501321453",
  appId: "1:345501321453:web:eb97d42490dcaa94f024e4"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message:", payload);

  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: "/icon.png",
    }
  );
});