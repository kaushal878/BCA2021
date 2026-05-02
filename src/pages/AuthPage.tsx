import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SEED_STUDENTS } from "../lib/students";
import { ConfigBanner } from "../components/ConfigBanner";

type Mode = "login" | "register";

export const AuthPage = ({ initialMode }: { initialMode: Mode }) => {
  const { user, configured, registerWithEmail, loginWithEmail, loginWithGoogle } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? "/dashboard";

  const seedOptions = useMemo(
    () =>
      [{ regNumber: "", name: "Select your registration number" }, ...SEED_STUDENTS],
    []
  );

  if (user) return <Navigate to={redirectTo} replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") {
        await loginWithEmail(email.trim(), password);
      } else {
        if (!regNumber) {
          throw new Error("Please pick your registration number.");
        }
        await registerWithEmail({
          email: email.trim(),
          password,
          name: name.trim(),
          regNumber,
        });
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setBusy(true);
    setError(null);
    try {
      await loginWithGoogle(regNumber || undefined);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <ConfigBanner />
      <div className="glass-strong p-6">
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/40 bg-white/40 p-1 dark:border-white/10 dark:bg-white/5">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                mode === m
                  ? "bg-gradient-to-r from-brand-500 to-purple-500 text-white shadow"
                  : "text-slate-600 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              {m === "login" ? "Sign in" : "Register"}
            </button>
          ))}
        </div>

        <h1 className="text-xl font-bold">
          {mode === "login" ? "Welcome back" : "Join BCA2021"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {mode === "login"
            ? "Sign in with your batch email or Google account."
            : "Pick your registration number and create your account."}
        </p>

        <form onSubmit={submit} className="mt-4 space-y-3">
          {mode === "register" && (
            <>
              <div>
                <label className="label">Registration number</label>
                <select
                  className="input"
                  value={regNumber}
                  onChange={(e) => {
                    setRegNumber(e.target.value);
                    const seed = SEED_STUDENTS.find(
                      (s) => s.regNumber === e.target.value
                    );
                    if (seed && !name) setName(seed.name);
                  }}
                  required
                >
                  {seedOptions.map((s) => (
                    <option
                      key={s.regNumber || "_"}
                      value={s.regNumber}
                      disabled={!s.regNumber}
                    >
                      {s.name}
                      {s.regNumber ? ` — ${s.regNumber}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Full name</label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name as on records"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={busy || !configured}
          >
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
          <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
          <span>or</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        </div>

        <button
          onClick={onGoogle}
          className="btn-ghost w-full justify-center"
          disabled={busy || !configured}
        >
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2C29.4 35 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.6 5.1C9.6 39.4 16.3 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.2 5.2C40.5 36 44 30.5 44 24c0-1.2-.1-2.3-.4-3.5z"
            />
          </svg>
          Continue with Google
        </button>

        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          By continuing you agree this batch space is for BCA 2021 students
          only. New here?{" "}
          <Link
            to="/students"
            className="font-semibold text-brand-600 hover:underline dark:text-brand-300"
          >
            See the student list
          </Link>
          .
        </p>
      </div>
    </div>
  );
};
