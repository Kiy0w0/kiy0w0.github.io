import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isOwner, loading } = useAuth();
  if (loading) return <main className="page blog"><p className="blog-muted">…</p></main>;
  if (!isOwner) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
