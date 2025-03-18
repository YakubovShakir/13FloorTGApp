self.onmessage = async (event) => {
  const { type, userId, collections } = event.data;

  const apiBase = "https://test.13thfloorgame.io/api";

  if (type === "syncRequest") {
    try {
      const response = await fetch(`${apiBase}/users/sleep/state/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success) {
        self.postMessage({ type: "sync", data });
      }
    } catch (err) {
      self.postMessage({ type: "log", message: `Worker sync error: ${err.message}` });
    }
  } else if (type === "collectCoins") {
    try {
      for (const collection of collections) {
        const response = await fetch(`${apiBase}/users/sleep/collect-coin/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(collection),
        });
        const data = await response.json();
        self.postMessage({ type: "collection", data });
      }
      // Sync after collections
      const syncResponse = await fetch(`${apiBase}/users/sleep/state/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const syncData = await syncResponse.json();
      if (syncData.success) {
        self.postMessage({ type: "sync", data: syncData });
      }
    } catch (err) {
      self.postMessage({ type: "log", message: `Worker collection error: ${err.message}` });
    }
  }
};

self.postMessage({ type: "log", message: "Worker initialized" });