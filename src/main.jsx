import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router";
import MainLayout from "./main-layout.jsx";
import Home from "./Home.jsx";
import History from "./History.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="/history" element={<History />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
