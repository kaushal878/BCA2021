import { useState, type ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { SEED_STUDENTS } from "../lib/students";
import {
  DashIcon,
  HomeIcon,
  LogoutIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
  UsersIcon,
} from "./Icons";

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const Layout = ({ children }: { children: ReactNode }) => {
  const { user, profile, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app-bg min-h-screen text-slate-800 dark:text-slate-100">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/30 bg-white/40 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5 lg:hidden">
        <button
          onClick={() => setOpen((o) => !o)}
          className="btn-ghost !px-2 !py-2"
          aria-label="Toggle navigation"
        >
          <MenuIcon />
        </button>
        <Link to="/" className="text-lg font-bold tracking-tight">
          BCA<span className="text-brand-500">2021</span>
        </Link>
        <button
          onClick={toggle}
          className="btn-ghost !px-2 !py-2"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-4 lg:py-6">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 transform overflow-y-auto p-4 transition-transform duration-200 lg:static lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="glass-strong flex h-full flex-col gap-4 p-4">
            <div className="hidden items-center justify-between lg:flex">
              <Link to="/" className="text-xl font-bold tracking-tight">
                BCA<span className="text-brand-500">2021</span>
              </Link>
              <button
                onClick={toggle}
                className="btn-ghost !px-2 !py-2"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {[
                { to: "/", label: "Home", icon: <HomeIcon /> },
                { to: "/dashboard", label: "Dashboard", icon: <DashIcon /> },
                { to: "/students", label: "Students", icon: <UsersIcon /> },
                { to: "/profile", label: "My Profile", icon: <UserIcon /> },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-brand-500/10 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200"
                        : "text-slate-600 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-white/10"
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-1 border-t border-white/40 pt-3 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
              Batch BCA 2021
            </div>
            <div className="flex flex-col gap-1 overflow-y-auto pr-1">
              {SEED_STUDENTS.map((s) => (
                <NavLink
                  key={s.regNumber}
                  to={`/students/${s.slug}`}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-2 py-1.5 text-xs transition ${
                      isActive
                        ? "bg-brand-500/10 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200"
                        : "text-slate-500 hover:bg-white/60 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200"
                    }`
                  }
                >
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-gradient-to-br from-brand-500 to-purple-500 text-[10px] font-semibold text-white">
                    {initials(s.name)}
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="font-semibold">{s.name}</span>
                    <span className="opacity-70">{s.regNumber}</span>
                  </span>
                </NavLink>
              ))}
            </div>

            <div className="mt-auto">
              {user && profile ? (
                <div className="glass flex items-center gap-3 p-3">
                  {profile.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt={profile.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-purple-500 text-sm font-semibold text-white">
                      {initials(profile.name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      {profile.name}
                    </div>
                    <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {profile.email}
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="btn-ghost !px-2 !py-2"
                    aria-label="Logout"
                    title="Logout"
                  >
                    <LogoutIcon />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-primary w-full">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {open && (
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
};
