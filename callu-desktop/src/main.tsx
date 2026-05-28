import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

declare global {
  interface Window {
    electron: {
      send: (channel: string, data?: any) => void;
      on: (channel: string, callback: (...args: any[]) => void) => () => void;
      invoke: (channel: string, data?: any) => Promise<any>;
    };
    CALLU_SERVER_URL?: string | null;
  }
}

async function bootstrap() {
  let secureSession: string | null = null;

  if (window.electron) {
    try {
      secureSession = await window.electron.invoke("get-secure-session");
    } catch (e) {
      console.error("Failed to load secure session:", e);
    }

    try {
      window.CALLU_SERVER_URL = await window.electron.invoke("get-server-url");
      console.log("[Boot] Fetched CALLU_SERVER_URL:", window.CALLU_SERVER_URL);
    } catch (e) {
      console.error("Failed to load server URL:", e);
      window.CALLU_SERVER_URL = null;
    }

    // Cleanup legacy keys
    window.localStorage.removeItem("callu_last_route");

    // Intercept localStorage for session token (Rule 6)
    const originalGetItem = window.localStorage.getItem.bind(window.localStorage);
    const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
    const originalRemoveItem = window.localStorage.removeItem.bind(window.localStorage);

    window.localStorage.getItem = (key: string) => {
      if (key === "callu_session") {
        return secureSession;
      }
      return originalGetItem(key);
    };

    window.localStorage.setItem = (key: string, value: string) => {
      if (key === "callu_session") {
        secureSession = value;
        window.electron.send("set-secure-session", value);
        return;
      }
      originalSetItem(key, value);
    };

    window.localStorage.removeItem = (key: string) => {
      if (key === "callu_session") {
        secureSession = null;
        window.electron.send("remove-secure-session");
        return;
      }
      originalRemoveItem(key);
    };
  }

  // Intercept fetch calls to point to live server (Render URL)
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    let url = typeof input === "string" ? input : (input instanceof URL ? input.href : (input as Request).url);
    const baseUrl = window.CALLU_SERVER_URL || import.meta.env.VITE_API_URL || "https://callu.up.railway.app";

    if (url.includes("/api/") && !url.startsWith(baseUrl)) {
      // In dev, if there's no custom server URL, we rely on Vite's proxy for relative URLs.
      if (!import.meta.env.DEV || window.CALLU_SERVER_URL) {
        const apiIndex = url.indexOf("/api/");
        url = `${baseUrl}${url.substring(apiIndex)}`;
      }
    }

    if (input instanceof Request) {
      const newRequest = new Request(url, input);
      return originalFetch(newRequest, init);
    }

    return originalFetch(url, init);
  };

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
