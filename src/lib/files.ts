import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { getFirebase } from "./firebase";
import { categoryFor, type FileDoc, type StudentProfile } from "./types";

export type UploadProgress = {
  fileName: string;
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
  state: "running" | "paused" | "success" | "error" | "canceled";
  error?: string;
};

export const uploadOne = (
  file: File,
  owner: StudentProfile,
  onProgress: (p: UploadProgress) => void
): Promise<FileDoc> =>
  new Promise((resolve, reject) => {
    const fb = getFirebase();
    if (!fb) {
      reject(new Error("Firebase not configured"));
      return;
    }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
    const storagePath = `users/${owner.uid}/${Date.now()}_${safeName}`;
    const storageRef = ref(fb.storage, storagePath);
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type || "application/octet-stream",
    });
    task.on(
      "state_changed",
      (snap) => {
        onProgress({
          fileName: file.name,
          progress: snap.totalBytes
            ? snap.bytesTransferred / snap.totalBytes
            : 0,
          bytesTransferred: snap.bytesTransferred,
          totalBytes: snap.totalBytes,
          state: snap.state as UploadProgress["state"],
        });
      },
      (err) => {
        onProgress({
          fileName: file.name,
          progress: 0,
          bytesTransferred: 0,
          totalBytes: file.size,
          state: "error",
          error: err.message,
        });
        reject(err);
      },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          const data: Omit<FileDoc, "id"> = {
            ownerUid: owner.uid,
            ownerName: owner.name,
            ownerReg: owner.regNumber,
            name: file.name,
            size: file.size,
            contentType: file.type || "application/octet-stream",
            category: categoryFor(file.type, file.name),
            storagePath,
            downloadURL: url,
            createdAt: Date.now(),
            shared: true,
          };
          const docRef = await addDoc(collection(fb.db, "files"), data);
          onProgress({
            fileName: file.name,
            progress: 1,
            bytesTransferred: file.size,
            totalBytes: file.size,
            state: "success",
          });
          resolve({ id: docRef.id, ...data });
        } catch (err) {
          reject(err as Error);
        }
      }
    );
  });

export const listFilesByOwner = async (
  ownerUid: string
): Promise<FileDoc[]> => {
  const fb = getFirebase();
  if (!fb) return [];
  const q = query(
    collection(fb.db, "files"),
    where("ownerUid", "==", ownerUid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FileDoc, "id">) }));
};

export const listAllFiles = async (): Promise<FileDoc[]> => {
  const fb = getFirebase();
  if (!fb) return [];
  const q = query(collection(fb.db, "files"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FileDoc, "id">) }));
};

export const getFileById = async (id: string): Promise<FileDoc | null> => {
  const fb = getFirebase();
  if (!fb) return null;
  const snap = await getDoc(doc(fb.db, "files", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<FileDoc, "id">) };
};

export const updateFileMeta = async (
  id: string,
  patch: Partial<Pick<FileDoc, "name" | "description" | "category" | "shared">>
) => {
  const fb = getFirebase();
  if (!fb) return;
  await updateDoc(doc(fb.db, "files", id), patch);
};

export const deleteFile = async (file: FileDoc) => {
  const fb = getFirebase();
  if (!fb) return;
  try {
    await deleteObject(ref(fb.storage, file.storagePath));
  } catch (err) {
    // Object may already be gone — ignore so the doc cleanup still proceeds.
    console.warn("Failed to delete storage object", err);
  }
  await deleteDoc(doc(fb.db, "files", file.id));
};
