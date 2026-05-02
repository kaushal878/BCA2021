import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ConfigBanner } from "../components/ConfigBanner";
import { FileCard } from "../components/FileCard";
import { deleteFile, listFilesByOwner } from "../lib/files";
import { getProfileBySlug } from "../lib/profiles";
import type { FileDoc, StudentProfile } from "../lib/types";

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const StudentDetailPage = () => {
  const { slug = "" } = useParams();
  const { user, isAdmin } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [files, setFiles] = useState<FileDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const p = await getProfileBySlug(slug);
      if (cancelled) return;
      setProfile(p);
      if (p && !p.uid.startsWith("seed:")) {
        const f = await listFilesByOwner(p.uid);
        if (!cancelled) setFiles(f);
      } else {
        setFiles([]);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, refreshKey]);

  const onDelete = async (file: FileDoc) => {
    if (!user) return;
    if (!window.confirm(`Delete "${file.name}"?`)) return;
    await deleteFile(file);
    setRefreshKey((k) => k + 1);
  };

  if (!profile) {
    return (
      <div className="glass p-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Student not found.{" "}
        <Link
          to="/students"
          className="font-semibold text-brand-600 hover:underline dark:text-brand-300"
        >
          Back to directory
        </Link>
        .
      </div>
    );
  }

  const isSeed = profile.uid.startsWith("seed:");

  return (
    <div className="space-y-5">
      <ConfigBanner />

      <section className="glass-strong flex flex-wrap items-center gap-5 p-6">
        {profile.photoURL ? (
          <img
            src={profile.photoURL}
            alt={profile.name}
            className="h-24 w-24 rounded-2xl object-cover"
          />
        ) : (
          <div className="grid h-24 w-24 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 text-2xl font-bold text-white">
            {initials(profile.name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {profile.regNumber}
            {profile.email ? ` · ${profile.email}` : ""}
          </div>
          {profile.bio && (
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              {profile.bio}
            </p>
          )}
          {isSeed && (
            <div className="mt-2 inline-flex rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
              Hasn’t joined yet — once they sign up, their uploads appear here.
            </div>
          )}
        </div>
      </section>

      <section className="glass-strong p-4">
        <h2 className="mb-3 text-lg font-bold">
          {profile.name.split(" ")[0]}’s uploads
        </h2>
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="glass h-44 animate-pulse bg-white/40 dark:bg-white/5"
              />
            ))}
          </div>
        ) : files.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {files.map((f) => (
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
            No uploads yet.
          </div>
        )}
      </section>
    </div>
  );
};
