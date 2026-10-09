import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import "./styles/index.css";

// App entry point: mounts the router (BrowserRouter, so URLs are real paths,
// not hash fragments) around the app, which contains both the public site and
// the /admin dashboard.
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);