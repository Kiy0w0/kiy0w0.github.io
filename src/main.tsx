import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SiteAmbience } from "./components/SiteAmbience";
import { Profile } from "./pages/Profile";
import { ProtectedRoute } from "./components/blog/ProtectedRoute";
import { isBlogHost, isFileHost, blogUrl } from "./lib/host";
import "./index.css";
import "./blog.css";

function BlogRedirect({ path = "" }: { path?: string }) {
  if (typeof window !== "undefined") window.location.replace(blogUrl + path);
  return null;
}

function PostRedirect() {
  const slug = window.location.pathname.replace(/^\/blog\//, "");
  return <BlogRedirect path={"/" + slug} />;
}

const BlogList = lazy(() => import("./pages/BlogList").then((m) => ({ default: m.BlogList })));
const BlogPost = lazy(() => import("./pages/BlogPost").then((m) => ({ default: m.BlogPost })));
const Login = lazy(() => import("./pages/Login").then((m) => ({ default: m.Login })));
const Editor = lazy(() => import("./pages/Editor").then((m) => ({ default: m.Editor })));
const Photography = lazy(() => import("./pages/Photography").then((m) => ({ default: m.Photography })));
const Friends = lazy(() => import("./pages/Friends").then((m) => ({ default: m.Friends })));
const Portfolio = lazy(() => import("./pages/Portfolio").then((m) => ({ default: m.Portfolio })));
const NotFound = lazy(() => import("./pages/NotFound").then((m) => ({ default: m.NotFound })));
const FileHost = lazy(() => import("./pages/FileHost").then((m) => ({ default: m.FileHost })));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        {!isFileHost && <SiteAmbience />}
        <Suspense fallback={<main className="page blog"><div className="blog-wrap"><p className="blog-muted">loading…</p></div></main>}>
          <Routes>
            {isFileHost ? (
              <>
                <Route path="/" element={<FileHost />} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
              </>
            ) : (
              <>
                <Route path="/" element={isBlogHost ? <BlogList /> : <Profile />} />
                {isBlogHost && <Route path="/:slug" element={<BlogPost />} />}
                <Route path="/blog" element={isBlogHost ? <BlogList /> : <BlogRedirect />} />
                <Route path="/blog/new" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
                <Route path="/blog/edit/:id" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
                <Route path="/blog/:slug" element={isBlogHost ? <BlogPost /> : <PostRedirect />} />
                <Route path="/photography" element={<Photography />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
              </>
            )}
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
