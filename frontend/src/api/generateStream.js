const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function streamGenerate({ type, prompt, onDelta, onDone, onError }) {
  const token = localStorage.getItem("devpilot_token");
  let response;
  try {
    response = await fetch(`${API_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ type, prompt }),
    });
  } catch {
    onError?.("Network error — is the backend running?");
    return;
  }
  if (!response.ok || !response.body) {
    let errMessage = "Failed to start generation";
    try { const errJson = await response.json(); errMessage = errJson.message || errMessage; } catch { /* not JSON */ }
    onError?.(errMessage);
    return;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop();
    for (const rawEvent of events) {
      if (!rawEvent.trim()) continue;
      let eventType = "message", data = "";
      for (const line of rawEvent.split("\n")) {
        if (line.startsWith("event:")) eventType = line.slice(6).trim();
        if (line.startsWith("data:")) data = line.slice(5).trim();
      }
      if (!data) continue;
      let parsed;
      try { parsed = JSON.parse(data); } catch { continue; }
      if (eventType === "done") onDone?.();
      else if (eventType === "error") onError?.(parsed.message);
      else onDelta?.(parsed.text);
    }
  }
}
