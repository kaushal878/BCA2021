import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ConfigBanner } from "../components/ConfigBanner";
import { SEED_STUDENTS } from "../lib/students";
import {
  DashIcon,
  FileIcon,
  UploadIcon,
  UsersIcon,
} from "../components/Icons";

const features = [
  {
    icon: <UploadIcon />,
    title: "Multi-file uploads",
    text: "Drag & drop dozens of photos, PDFs, and notes at once with live progress.",
  },
  {
    icon: <FileIcon />,
    title: "Cloud storage",
    text: "All files live in Firebase Storage — accessible anywhere, anytime, on any device.",
  },
  {
    icon: <UsersIcon />,
    title: "Batch directory",
    text: "Browse every BCA 2021 student profile and the resources they’ve shared with the batch.",
  },
  {
    icon: <DashIcon />,
    title: "Smart dashboard",
    text: "Filter by images, PDFs, syllabus, or notes; search across files and owners instantly.",
  },
];

export const HomePage = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <ConfigBanner />
      <section className="glass-strong relative overflow-hidden p-8">
        <div className="relative z-10 max-w-3xl">
          <span className="rounded-full border border-white/40 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:border-white/10 dark:bg-white/10 dark:text-brand-200">
            Batch BCA 2021 · Personal &amp; Group Cloud
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            One place for every photo, note, and syllabus the batch shares.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-300">
            BCA2021 is a private cloud built for our batch — sign in with email
            or Google, drag your files in, and let everyone access the
            collective notes, photos, and syllabus from anywhere.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {user ? (
              <Link to="/dashboard" className="btn-primary">
                Go to dashboard
              </Link>
            ) : (
              <Link to="/login" className="btn-primary">
                Sign in / Register
              </Link>
            )}
            <Link to="/students" className="btn-ghost">
              View student directory
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-20 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="glass p-4">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 text-white">
              {f.icon}
            </div>
            <div className="text-sm font-semibold">{f.title}</div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {f.text}
            </p>
          </div>
        ))}
      </section>

      <section className="glass-strong p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold">Your batchmates</h2>
          <Link
            to="/students"
            className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
          >
            See all
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {SEED_STUDENTS.map((s) => (
            <Link
              key={s.regNumber}
              to={`/students/${s.slug}`}
              className="glass flex items-center gap-3 p-3 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-gradient-to-br from-brand-500 to-purple-500 text-sm font-semibold text-white">
                {s.name
                  .split(" ")
                  .map((p) => p.charAt(0))
                  .slice(0, 2)
                  .join("")}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{s.name}</div>
                <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {s.regNumber}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
