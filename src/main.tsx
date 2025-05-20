import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { initColors } from "ntc-ts";
import { ORIGINAL_COLORS } from "ntc-ts";
import { UserContextProvider } from "./contexts/UserProvider.tsx";
import { registerSW } from "virtual:pwa-register";
import { showToast } from "./utils/showToast.tsx";
import { updatePrompt } from "./utils/updatePrompt.tsx";
import { CircularProgress } from "@mui/material";
import toast from "react-hot-toast";

// Add error handling for the root element
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

// initialize ntc colors
try {
  initColors(ORIGINAL_COLORS);
} catch (error) {
  console.error("Failed to initialize colors:", error);
}

const offlinePreparationCount = parseInt(
  // prevent toast from showing infinitely on older versions of the app
  localStorage.getItem("offlinePreparationCount") || "0",
  10,
);

if (
  offlinePreparationCount < 3 &&
  !localStorage.getItem("initialCachingComplete") &&
  process.env.NODE_ENV !== "development"
) {
  showToast("Preparing app for offline use...", {
    duration: Infinity,
    type: "blank",
    id: "initial-offline-preparation",
    icon: <CircularProgress size={20} thickness={4} />,
  });

  localStorage.setItem("offlinePreparationCount", (offlinePreparationCount + 1).toString());
}

// Show a prompt to update the app when a new version is available
registerSW({
  onRegistered(r) {
    if (r) {
      updatePrompt(r);
    }
  },
  onOfflineReady() {
    toast.dismiss("initial-offline-preparation");

    if (!localStorage.getItem("initialCachingComplete")) {
      showToast("App is ready to work offline.", { type: "success" });
      localStorage.setItem("initialCachingComplete", "true");
    }
  },
});

// Listen for the `SKIP_WAITING` message and reload the page when the new SW takes over
navigator.serviceWorker?.addEventListener("controllerchange", () => {
  window.location.reload();
});

// Wrap the render in a try-catch block
try {
  ReactDOM.createRoot(rootElement).render(
    <BrowserRouter>
      <UserContextProvider>
        <App />
      </UserContextProvider>
    </BrowserRouter>
  );
} catch (error) {
  console.error("Failed to render the app:", error);
  // Show a user-friendly error message
  rootElement.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 20px;
    ">
      <h1>Something went wrong</h1>
      <p>Please try refreshing the page. If the problem persists, try clearing your browser cache.</p>
      <button onclick="window.location.reload()" style="
        padding: 10px 20px;
        margin-top: 20px;
        cursor: pointer;
      ">Refresh Page</button>
    </div>
  `;
}
