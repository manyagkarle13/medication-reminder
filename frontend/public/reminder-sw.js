self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (error) {
    payload = { body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "Medicine Reminder";
  const options = {
    body: payload.body || "You have a scheduled medicine reminder.",
    tag: payload.tag || "medicine-reminder",
    renotify: true,
    requireInteraction: true,
    icon: "/next.svg",
    badge: "/next.svg",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of allClients) {
        if ("focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            await client.navigate("/dashboard");
          }
          return;
        }
      }
      if (clients.openWindow) {
        await clients.openWindow("/dashboard");
      }
    })(),
  );
});
