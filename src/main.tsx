import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Profile } from "./pages/Profile";
import { BlogList } from "./pages/BlogList";
import { BlogPost } from "./pages/BlogPost";
import { Login } from "./pages/Login";
import { Editor } from "./pages/Editor";
import { Photography } from "./pages/Photography";
import { Friends } from "./pages/Friends";
import { ProtectedRoute } from "./components/blog/ProtectedRoute";
import "./index.css";
import "./blog.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Profile />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/new" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
          <Route path="/blog/edit/:id" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/photography" element={<Photography />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
