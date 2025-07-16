import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import { ToastProvider } from "./components/toast/ToastProvider";

export default function App() {
  return (
    <Router
      root={(props) => (
        <>
          <Suspense>
            {props.children}

            <ToastProvider />
          </Suspense>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
