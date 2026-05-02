import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UploadDropzone } from "../components/UploadDropzone";
import { FileCard } from "../components/FileCard";
import { ConfigBanner } from "../components/ConfigBanner";
import {
  deleteFile,
  listAllFiles,
  listFilesByOwner,
} from "../lib/files";
import {
  formatBytes,
  type FileCategory,
  type FileDoc,
} from "../lib/types";
import { SearchIcon } from "../components/Icons";

type Scope = "mine" | "all";

const CATEGORIES: Array<{ id: FileCategory | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "image", label: "Images" },
  { id: "pdf", label: "PDFs" },
  { id: "document", label: "Documents" },
  { id: "syllabus", label: "Syllabus" },
  { id: "other", label: "Other" },
];

export const DashboardPage = () => {
  const { user, profile, configured, isAdmin } = useAuth();
  const [files, setFiles] = useState<FileDoc[]>([]);
  const [scope, setScope] = useState<Scope>("mine");
  const [category, setCategory] = useState<FileCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!configured || !user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const list =
        scope === "mine" ? await listFilesByOwner(user.uid) : await listAllFiles();
      if (!cancelled) {
        setFiles(list);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, scope, configured, refreshKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return files.filter((f) => {
      if (category !== "all" && f.category !== category) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.ownerName.toLowerCase().includes(q) ||
        f.ownerReg.toLowerCase().includes(q)
      );
    });
  }, [files, category, search]);

  const totals = useMemo(() => {
    const total = files.length;
    const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);
    const byCat = files.reduce<Record<FileCategory, number>>(
      (acc, f) => {
        acc[f.category] = (acc[f.category] || 0) + 1;
        return acc;
      },
      { image: 0, pdf: 0, document: 0, syllabus: 0, other: 0 }
    );
    return { total, totalSize, byCat };
  }, [files]);

  const onDelete = async (file: FileDoc) => {
    if (!user) return;
    const owns = file.ownerUid === user.uid || isAdmin;
    if (!owns) return;
    if (!window.confirm(`Delete "${file.name}"? This cannot be undone.`)) return;
    await deleteFile(file);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-5">
      <ConfigBanner />

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hi {profile?.name?.split(" ")[0] ?? "there"}, manage and explore
            batch uploads here.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/40 bg-white/40 p-1 dark:border-white/10 dark:bg-white/5">
          {(
            [
              { id: "mine", label: "My files" },
              { id: "all", label: "Batch files" },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              onClick={() => setScope(s.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                scope === s.id
                  ? "bg-gradient-to-r from-brand-500 to-purple-500 text-white shadow"
                  : "text-slate-600 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Total files
          </div>
          <div className="mt-1 text-2xl font-bold">{totals.total}</div>
        </div>
        <div className="glass p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Total size
          </div>
          <div className="mt-1 text-2xl font-bold">
            {formatBytes(totals.totalSize)}
          </div>
        </div>
        <div className="glass p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Images
          </div>
          <div className="mt-1 text-2xl font-bold">{totals.byCat.image}</div>
        </div>
        <div className="glass p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Documents &amp; PDFs
          </div>
          <div className="mt-1 text-2xl font-bold">
            {totals.byCat.document + totals.byCat.pdf + totals.byCat.syllabus}
          </div>
        </div>
      </section>

      <UploadDropzone onUploaded={() => setRefreshKey((k) => k + 1)} />

      <section className="glass-strong space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search by file name, owner, or reg number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  category === c.id
                    ? "border-transparent bg-gradient-to-r from-brand-500 to-purple-500 text-white"
                    : "border-white/40 bg-white/50 text-slate-600 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="glass h-44 animate-pulse bg-white/40 dark:bg-white/5"
              />
            ))}
          </div>
        ) : filtered.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((f) => (
              <FileCard
                key={f.id}
                file={f}
                canManage={!!user && (f.ownerUid === user.uid || isAdmin)}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <div className="glass p-6 text-center text-sm text-slate-500 dark:text-slate-400">
            No files match your filters yet. Upload something above or browse
            the{" "}
            <Link
              to="/students"
              className="font-semibold text-brand-600 hover:underline dark:text-brand-300"
            >
              student directory
            </Link>
            .
          </div>
        )}
      </section>
    </div>
  );
};
