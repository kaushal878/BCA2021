import { useCallback, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { uploadOne, type UploadProgress } from "../lib/files";
import { UploadIcon } from "./Icons";

type Props = {
  onUploaded?: () => void;
};

export const UploadDropzone = ({ onUploaded }: Props) => {
  const { profile } = useAuth();
  const [dragOver, setDragOver] = useState(false);
  const [items, setItems] = useState<UploadProgress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!profile) {
        setError("You must be signed in to upload.");
        return;
      }
      setError(null);
      const list = Array.from(files);
      if (!list.length) return;
      setItems((prev) => [
        ...prev,
        ...list.map<UploadProgress>((f) => ({
          fileName: f.name,
          progress: 0,
          bytesTransferred: 0,
          totalBytes: f.size,
          state: "running",
        })),
      ]);

      await Promise.all(
        list.map(async (file) => {
          try {
            await uploadOne(file, profile, (p) => {
              setItems((prev) =>
                prev.map((it) =>
                  it.fileName === p.fileName
                    ? { ...it, ...p }
                    : it
                )
              );
            });
          } catch (err) {
            setError((err as Error).message);
          }
        })
      );

      onUploaded?.();
    },
    [profile, onUploaded]
  );

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      void handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-3">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`glass-strong block cursor-pointer p-6 text-center transition ${
          dragOver
            ? "ring-2 ring-brand-400"
            : "hover:bg-white/80 dark:hover:bg-white/10"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-purple-500 text-white">
          <UploadIcon width={22} height={22} />
        </div>
        <div className="text-base font-semibold">
          Drag &amp; drop files here
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          or click to browse — multiple files supported (images, PDFs, docs,
          notes)
        </div>
      </label>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      {items.length > 0 && (
        <div className="glass space-y-2 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Uploads
          </div>
          {items.map((it) => (
            <div key={it.fileName} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate pr-2">{it.fileName}</span>
                <span
                  className={`text-xs ${
                    it.state === "error"
                      ? "text-red-500"
                      : it.state === "success"
                        ? "text-emerald-500"
                        : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {it.state === "success"
                    ? "Done"
                    : it.state === "error"
                      ? it.error ?? "Failed"
                      : `${Math.round(it.progress * 100)}%`}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className={`h-full rounded-full transition-all ${
                    it.state === "error"
                      ? "bg-red-400"
                      : "bg-gradient-to-r from-brand-500 to-purple-500"
                  }`}
                  style={{ width: `${Math.round(it.progress * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
