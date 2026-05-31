/* VYBI service worker — web push notifications */
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "Vybi", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Vybi";
  const options = {
    body: data.body || "",
    badge: "/favicon.ico",
    data: { url: data.url || "/" },
    tag: data.tag,
    renotify: !!data.tag,
    vibrate: [80, 40, 80],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const c of wins) {
        if ("focus" in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    }),
  );
});
