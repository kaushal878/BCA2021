import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ConfigBanner } from "../components/ConfigBanner";
import {
  deleteFile,
  getFileById,
  updateFileMeta,
} from "../lib/files";
import {
  formatBytes,
  formatDate,
  type FileDoc,
} from "../lib/types";
import { DownloadIcon, TrashIcon } from "../components/Icons";

export const FileViewerPage = () => {
  const { id = "" } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<FileDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const f = await getFileById(id);
        if (cancelled) return;
        setFile(f);
        if (f) {
          setName(f.name);
          setDescription(f.description ?? "");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="glass grid h-40 place-items-center text-sm text-slate-500 dark:text-slate-400">
        Loading file…
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="glass p-6 text-center text-sm text-slate-500 dark:text-slate-400">
        {error ?? "File not found."}{" "}
        <Link
          to="/dashboard"
          className="font-semibold text-brand-600 hover:underline dark:text-brand-300"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const canManage = !!user && (file.ownerUid === user.uid || isAdmin);

  const onSave = async () => {
    setBusy(true);
    try {
      await updateFileMeta(file.id, { name: name.trim(), description });
      setFile({ ...file, name: name.trim(), description });
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm("Delete this file? This cannot be undone.")) return;
    await deleteFile(file);
    navigate("/dashboard");
  };

  return (
    <div className="space-y-5">
      <ConfigBanner />
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{file.name}</h1>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Shared by{" "}
            <Link
              to={`/students/${file.ownerName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "")}`}
              className="font-semibold text-brand-600 hover:underline dark:text-brand-300"
            >
              {file.ownerName}
            </Link>{" "}
            · {file.ownerReg} · {formatBytes(file.size)} ·{" "}
            {formatDate(file.createdAt)}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={file.downloadURL}
            target="_blank"
            rel="noreferrer"
            download={file.name}
            className="btn-primary"
          >
            <DownloadIcon /> Download
          </a>
          {canManage && (
            <>
              <button
                onClick={() => setEditing((e) => !e)}
                className="btn-ghost"
              >
                {editing ? "Cancel edit" : "Edit"}
              </button>
              <button onClick={onDelete} className="btn-danger">
                <TrashIcon /> Delete
              </button>
            </>
          )}
        </div>
      </header>

      <section className="glass-strong p-4">
        {file.category === "image" && (
          <img
            src={file.downloadURL}
            alt={file.name}
            className="mx-auto max-h-[70vh] w-auto rounded-xl object-contain"
          />
        )}
        {file.category === "pdf" && (
          <iframe
            src={file.downloadURL}
            title={file.name}
            className="h-[80vh] w-full rounded-xl border border-white/30 bg-white/30 dark:border-white/10 dark:bg-white/5"
          />
        )}
        {file.category !== "image" && file.category !== "pdf" && (
          <div className="grid place-items-center gap-3 p-12 text-center text-sm text-slate-500 dark:text-slate-400">
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 text-3xl font-bold text-white">
              {file.name.split(".").pop()?.toUpperCase() ?? "FILE"}
            </div>
            <div>
              No inline preview for this file type — use Download to open it.
            </div>
          </div>
        )}
      </section>

      {(file.description || canManage) && (
        <section className="glass-strong space-y-3 p-4">
          {editing ? (
            <>
              <div>
                <label className="label">File name</label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input min-h-[80px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's in this file?"
                />
              </div>
              <button
                onClick={onSave}
                className="btn-primary"
                disabled={busy}
              >
                {busy ? "Saving…" : "Save changes"}
              </button>
            </>
          ) : (
            <div className="text-sm text-slate-600 dark:text-slate-300">
              {file.description || (
                <span className="text-slate-400 dark:text-slate-500">
                  No description provided.
                </span>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
