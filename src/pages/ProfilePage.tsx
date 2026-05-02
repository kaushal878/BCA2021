import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ConfigBanner } from "../components/ConfigBanner";
import { FileCard } from "../components/FileCard";
import { UploadDropzone } from "../components/UploadDropzone";
import {
  deleteFile,
  listFilesByOwner,
} from "../lib/files";
import {
  updateProfileFields,
  uploadProfilePhoto,
} from "../lib/profiles";
import type { FileDoc } from "../lib/types";

export const ProfilePage = () => {
  const { user, profile, refreshProfile, isAdmin } = useAuth();
  const [files, setFiles] = useState<FileDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const photoInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(profile?.name ?? "");
    setBio(profile?.bio ?? "");
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const list = await listFilesByOwner(user.uid);
      if (!cancelled) {
        setFiles(list);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, refreshKey]);

  const onSave = async () => {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await updateProfileFields(user.uid, { name: name.trim(), bio });
      await refreshProfile();
      setEditing(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onPhoto = async (file: File) => {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      const url = await uploadProfilePhoto(user.uid, file);
      await updateProfileFields(user.uid, { photoURL: url });
      await refreshProfile();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (f: FileDoc) => {
    if (!window.confirm(`Delete "${f.name}"?`)) return;
    await deleteFile(f);
    setRefreshKey((k) => k + 1);
  };

  if (!profile) return null;

  return (
    <div className="space-y-5">
      <ConfigBanner />
      <section className="glass-strong p-6">
        <div className="flex flex-wrap items-start gap-5">
          <div className="relative">
            {profile.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.name}
                className="h-24 w-24 rounded-2xl object-cover ring-2 ring-white dark:ring-white/10"
              />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 text-2xl font-bold text-white">
                {profile.name
                  .split(" ")
                  .map((p) => p.charAt(0))
                  .slice(0, 2)
                  .join("")}
              </div>
            )}
            <button
              onClick={() => photoInput.current?.click()}
              className="absolute -bottom-2 right-1/2 translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500 to-purple-500 px-3 py-1 text-[11px] font-semibold text-white shadow"
            >
              {busy ? "…" : "Change"}
            </button>
            <input
              ref={photoInput}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onPhoto(f);
                e.target.value = "";
              }}
            />
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            {editing ? (
              <>
                <div>
                  <label className="label">Display name</label>
                  <input
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Bio</label>
                  <textarea
                    className="input min-h-[80px]"
                    value={bio ?? ""}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell your batchmates a little about you"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onSave}
                    className="btn-primary"
                    disabled={busy}
                  >
                    {busy ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setName(profile.name);
                      setBio(profile.bio ?? "");
                    }}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  {isAdmin && (
                    <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                      Admin
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {profile.regNumber || "Registration number not set"} ·{" "}
                  {profile.email}
                </div>
                {profile.bio && (
                  <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                    {profile.bio}
                  </p>
                )}
                <button
                  onClick={() => setEditing(true)}
                  className="btn-ghost"
                >
                  Edit profile
                </button>
              </>
            )}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </div>
            )}
          </div>
        </div>
      </section>

      <UploadDropzone onUploaded={() => setRefreshKey((k) => k + 1)} />

      <section className="glass-strong p-4">
        <h2 className="mb-3 text-lg font-bold">My uploads</h2>
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
                canManage
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <div className="glass p-6 text-center text-sm text-slate-500 dark:text-slate-400">
            You haven’t uploaded anything yet — drop files above to get started.
          </div>
        )}
      </section>
    </div>
  );
};
