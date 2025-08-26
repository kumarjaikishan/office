// src/utils/sse.js

let eventSource = null;

export const connectSSE = (onMessage, onError) => {
    if (eventSource) return eventSource; // Prevent multiple connections

    const token = localStorage.getItem("emstoken");

    // Native EventSource (no headers, so token must be in query string)
    eventSource = new EventSource(`${import.meta.env.VITE_SSE_ADDRESS}events?token=${token}`);

    eventSource.onopen = () => {
        console.log("✅ SSE connected from utils");
    };

    eventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (onMessage) onMessage(data);
        } catch (err) {
            console.error("SSE parse error:", err);
        }
    };

    eventSource.onerror = (err) => {
        console.warn("⚠️ SSE error, closing connection", err);
        eventSource.close();
        eventSource = null;
        if (onError) onError(err);
    };

    return eventSource;
};

export const closeSSE = () => {
    if (eventSource) {
        eventSource.close();
        eventSource = null;
        console.log("❌ SSE disconnected");
    }
};
