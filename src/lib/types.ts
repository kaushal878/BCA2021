export type FileCategory = "image" | "pdf" | "document" | "syllabus" | "other";

export type StudentProfile = {
  uid: string;
  name: string;
  regNumber: string;
  email: string;
  photoURL?: string | null;
  bio?: string | null;
  slug: string;
  createdAt?: number;
  updatedAt?: number;
};

export type FileDoc = {
  id: string;
  ownerUid: string;
  ownerName: string;
  ownerReg: string;
  name: string;
  size: number;
  contentType: string;
  category: FileCategory;
  storagePath: string;
  downloadURL: string;
  createdAt: number;
  description?: string;
  shared: boolean;
};

export const categoryFor = (
  contentType: string,
  fileName: string
): FileCategory => {
  const ct = contentType.toLowerCase();
  const lower = fileName.toLowerCase();
  if (ct.startsWith("image/")) return "image";
  if (ct === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  if (
    ct.includes("officedocument") ||
    ct.startsWith("text/") ||
    lower.endsWith(".doc") ||
    lower.endsWith(".docx") ||
    lower.endsWith(".ppt") ||
    lower.endsWith(".pptx") ||
    lower.endsWith(".xls") ||
    lower.endsWith(".xlsx") ||
    lower.endsWith(".txt") ||
    lower.endsWith(".md")
  ) {
    return "document";
  }
  if (lower.includes("syllabus")) return "syllabus";
  return "other";
};

export const formatBytes = (bytes: number): string => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  );
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
};

export const formatDate = (ts: number): string =>
  new Date(ts).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
