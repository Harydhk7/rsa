const cacheData = "appV1";

// Install Event: Cache necessary assets
this.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(cacheData)
      .then((cache) => {
        return cache.addAll([
          "/static/js/bundle.js",
          "/logo192.png",
          "/favicon.ico",
          "/manifest.json",
          "/index.html",
          "/",
          "/Users",
          "/Audit",
          "/Questionary",
          "/Retrievalid",
          "/Suggestion_mapping",
          "/Reports",
          "/user_list",
        ]);
      })
      .catch((error) => {
        console.error("Failed to cache resources during install:", error);
      })
  );
});

// Activate Event: Cleanup old caches
this.addEventListener("activate", (event) => {
  const cacheWhitelist = [cacheData];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch Event: Serve cached assets or fallback
this.addEventListener("fetch", (event) => {
  if (!navigator.onLine) {
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => {
          if (response) {
            return response; // Serve from cache if available
          }
          return new Response(
            "You are offline, and the requested resource is not cached.",
            {
              status: 404,
              statusText: "Not Found",
            }
          );
        })
        .catch((error) => {
          console.error("Error fetching resource:", error);
        })
    );
  } else {
    // For online scenarios, you can handle updates dynamically if needed
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request); // Fallback to cache if fetch fails
      })
    );
  }
});
