import { useAuth } from "../context/AuthContext";

export const ConfigBanner = () => {
  const { configured } = useAuth();
  if (configured) return null;
  return (
    <div className="glass mb-4 border-amber-300/40 bg-amber-50/70 p-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
      <strong>Firebase not configured.</strong> Copy <code>.env.example</code>{" "}
      to <code>.env</code> and fill in your Firebase project credentials, then
      restart the dev server. Authentication, uploads, and the student
      directory will be limited until then.
    </div>
  );
};
