self.onmessage = async (event) => {
  const { type, userId } = event.data;
  self.postMessage({ type: "log", message: `Worker received: ${type}` });

  if (type === "syncRequest") {
    try {
      const response = await fetch(`http://localhost:4000/api/users/sleep/state/${userId}`, { // Adjust URL
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      self.postMessage({ type: "log", message: `Fetch response: ${JSON.stringify(data)}` });
      if (data.success) {
        self.postMessage({ type: "sync", data });
      } else {
        self.postMessage({ type: "log", message: "Fetch failed: no success" });
      }
    } catch (err) {
      self.postMessage({ type: "log", message: `Worker sync error: ${err.message}` });
    }
  }
};

self.postMessage({ type: "log", message: "Worker initialized" });