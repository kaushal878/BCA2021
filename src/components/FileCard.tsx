import { Link } from "react-router-dom";
import {
  formatBytes,
  formatDate,
  type FileDoc,
} from "../lib/types";
import {
  DocIcon,
  DownloadIcon,
  FileIcon,
  ImageIcon,
  PdfIcon,
  TrashIcon,
} from "./Icons";

type Props = {
  file: FileDoc;
  canManage?: boolean;
  onDelete?: (file: FileDoc) => void;
};

const iconFor = (file: FileDoc) => {
  switch (file.category) {
    case "image":
      return <ImageIcon />;
    case "pdf":
      return <PdfIcon />;
    case "document":
    case "syllabus":
      return <DocIcon />;
    default:
      return <FileIcon />;
  }
};

export const FileCard = ({ file, canManage, onDelete }: Props) => {
  const isImage = file.category === "image";
  return (
    <div className="glass group relative flex flex-col gap-3 overflow-hidden p-3">
      <Link
        to={`/files/${file.id}`}
        className="block aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-brand-500/20 to-purple-500/20"
      >
        {isImage ? (
          <img
            src={file.downloadURL}
            alt={file.name}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-brand-700 dark:text-brand-200">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/60 shadow-glass dark:bg-white/10">
              {iconFor(file)}
            </span>
          </div>
        )}
      </Link>
      <div className="min-w-0">
        <Link
          to={`/files/${file.id}`}
          className="block truncate text-sm font-semibold hover:underline"
          title={file.name}
        >
          {file.name}
        </Link>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="truncate">{file.ownerName}</span>
          <span className="ml-2 flex-none">{formatBytes(file.size)}</span>
        </div>
        <div className="text-[11px] text-slate-400 dark:text-slate-500">
          {formatDate(file.createdAt)}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full border border-white/40 bg-white/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          {file.category}
        </span>
        <div className="flex items-center gap-1">
          <a
            href={file.downloadURL}
            target="_blank"
            rel="noreferrer"
            download={file.name}
            className="btn-ghost !px-2 !py-1.5 text-xs"
            title="Download"
          >
            <DownloadIcon width={14} height={14} />
          </a>
          {canManage && onDelete && (
            <button
              onClick={() => onDelete(file)}
              className="btn-ghost !px-2 !py-1.5 text-xs hover:!bg-red-500/10 hover:!text-red-500"
              title="Delete"
            >
              <TrashIcon width={14} height={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
