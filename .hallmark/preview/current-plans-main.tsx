import React from "react";
import { createRoot } from "react-dom/client";
import "../../app/globals.css";
import Dashboard from "./current-plans";
createRoot(document.getElementById("root")!).render(<Dashboard />);
