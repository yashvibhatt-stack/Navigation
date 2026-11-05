import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import BuildView from "./pages/BuildView";
import NavExploration from "./pages/NavExploration";
import CriticalAlarm from "./pages/CriticalAlarm";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/components.css";
import "./styles/search.css";

// Default = Navigation exploration (top bar + global search); #build and #alarm keep the earlier Live View flows
function App() {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => {
    const onHash = () => setHash(location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  if (hash === "#alarm") return <CriticalAlarm />;
  if (hash === "#build") return <BuildView />;
  return <NavExploration />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
