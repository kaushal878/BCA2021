import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user, loading, configured } = useAuth();
  const location = useLocation();

  if (!configured) {
    return (
      <div className="glass p-6 text-sm">
        Firebase isn’t configured yet, so authenticated pages are unavailable.
        Add your Firebase credentials to <code>.env</code> and restart the dev
        server.
      </div>
    );
  }
  if (loading) {
    return (
      <div className="glass grid h-40 place-items-center text-sm text-slate-500 dark:text-slate-400">
        Loading…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};
