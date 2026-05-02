import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ConfigBanner } from "../components/ConfigBanner";
import { SearchIcon } from "../components/Icons";
import { listAllProfiles } from "../lib/profiles";
import { SEED_STUDENTS, type SeedStudent } from "../lib/students";
import type { StudentProfile } from "../lib/types";

type Combined = SeedStudent & {
  profile?: StudentProfile;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const StudentListPage = () => {
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await listAllProfiles();
      if (!cancelled) {
        setProfiles(list);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const combined: Combined[] = useMemo(() => {
    return SEED_STUDENTS.map((s) => ({
      ...s,
      profile: profiles.find(
        (p) => p.regNumber === s.regNumber || p.slug === s.slug
      ),
    }));
  }, [profiles]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return combined;
    return combined.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.regNumber.toLowerCase().includes(q) ||
        s.profile?.email?.toLowerCase().includes(q)
    );
  }, [combined, search]);

  return (
    <div className="space-y-5">
      <ConfigBanner />

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">BCA 2021 Students</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            All 10 batchmates — click anyone to see their profile and shared
            uploads.
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by name or reg number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((s) => {
          const photo = s.profile?.photoURL;
          const joined = !!s.profile && !s.profile.uid.startsWith("seed:");
          return (
            <Link
              key={s.regNumber}
              to={`/students/${s.slug}`}
              className="glass group flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              {photo ? (
                <img
                  src={photo}
                  alt={s.name}
                  className="h-14 w-14 flex-none rounded-2xl object-cover"
                />
              ) : (
                <div className="grid h-14 w-14 flex-none place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 text-base font-semibold text-white">
                  {initials(s.name)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate text-sm font-semibold">{s.name}</div>
                  {joined && (
                    <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                      Active
                    </span>
                  )}
                </div>
                <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {s.regNumber}
                </div>
                {s.profile?.email && (
                  <div className="truncate text-[11px] text-slate-400 dark:text-slate-500">
                    {s.profile.email}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </section>

      {!loading && !filtered.length && (
        <div className="glass p-6 text-center text-sm text-slate-500 dark:text-slate-400">
          No matching students.
        </div>
      )}
    </div>
  );
};
