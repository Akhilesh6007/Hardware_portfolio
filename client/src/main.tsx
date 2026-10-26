import React, { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./styles/global.css";
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="empty-state">
        <h1>A small technical setback.</h1>
        <p>Reload the page to return to the lab.</p>
        <button className="button" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
const client = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60000 } },
});
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={client}>
        <BrowserRouter
          basename={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}
        >
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
