import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import "@/index.css";
import App from "@/App";
import ErrorBoundary from "@/components/ErrorBoundary";

function SmoothScroll({ children }) {
  const lenisRef = useRef(null);
  useEffect(() => {
    let rafId;
    let destroyed = false;
    import("lenis").then(({ default: Lenis }) => {
      if (destroyed) return;
      const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenisRef.current = lenis;
      window.__lenis = lenis;
      const raf = (time) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    });
    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      if (lenisRef.current) lenisRef.current.destroy();
      window.__lenis = undefined;
    };
  }, []);
  return <div ref={() => {}}>{children}</div>;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <SmoothScroll>
          <App />
          <Toaster theme="dark" position="bottom-right" />
        </SmoothScroll>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
