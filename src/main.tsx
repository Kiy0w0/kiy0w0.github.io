import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SiteAmbience } from "./components/SiteAmbience";
import { Profile } from "./pages/Profile";
import { ProtectedRoute } from "./components/blog/ProtectedRoute";
import "./index.css";
import "./blog.css";

const BlogList = lazy(() => import("./pages/BlogList").then((m) => ({ default: m.BlogList })));
const BlogPost = lazy(() => import("./pages/BlogPost").then((m) => ({ default: m.BlogPost })));
const Login = lazy(() => import("./pages/Login").then((m) => ({ default: m.Login })));
const Editor = lazy(() => import("./pages/Editor").then((m) => ({ default: m.Editor })));
const Photography = lazy(() => import("./pages/Photography").then((m) => ({ default: m.Photography })));
const Friends = lazy(() => import("./pages/Friends").then((m) => ({ default: m.Friends })));
const NotFound = lazy(() => import("./pages/NotFound").then((m) => ({ default: m.NotFound })));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <SiteAmbience />
        <Suspense fallback={<main className="page blog"><div className="blog-wrap"><p className="blog-muted">loading…</p></div></main>}>
          <Routes>
            <Route path="/" element={<Profile />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/new" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
            <Route path="/blog/edit/:id" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/photography" element={<Photography />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
