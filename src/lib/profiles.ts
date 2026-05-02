import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { getFirebase } from "./firebase";
import type { StudentProfile } from "./types";
import { findSeedBySlug } from "./students";

export const getProfileByUid = async (
  uid: string
): Promise<StudentProfile | null> => {
  const fb = getFirebase();
  if (!fb) return null;
  const snap = await getDoc(doc(fb.db, "profiles", uid));
  if (!snap.exists()) return null;
  return snap.data() as StudentProfile;
};

const seedToProfile = (seed: {
  name: string;
  regNumber: string;
  slug: string;
}): StudentProfile => ({
  uid: `seed:${seed.slug}`,
  name: seed.name,
  regNumber: seed.regNumber,
  email: "",
  photoURL: null,
  bio: null,
  slug: seed.slug,
});

export const getProfileBySlug = async (
  slug: string
): Promise<StudentProfile | null> => {
  const fb = getFirebase();
  if (fb) {
    try {
      const q = query(
        collection(fb.db, "profiles"),
        where("slug", "==", slug)
      );
      const snap = await getDocs(q);
      if (!snap.empty) return snap.docs[0].data() as StudentProfile;
    } catch {
      // Fall through to the seed lookup if Firestore is unreachable.
    }
  }

  // Fallback to a seed-only profile so unregistered students still show up.
  const seed = findSeedBySlug(slug);
  return seed ? seedToProfile(seed) : null;
};

export const listAllProfiles = async (): Promise<StudentProfile[]> => {
  const fb = getFirebase();
  if (!fb) return [];
  try {
    const snap = await getDocs(collection(fb.db, "profiles"));
    return snap.docs.map((d) => d.data() as StudentProfile);
  } catch {
    return [];
  }
};

export const updateProfileFields = async (
  uid: string,
  patch: Partial<StudentProfile>
) => {
  const fb = getFirebase();
  if (!fb) return;
  await updateDoc(doc(fb.db, "profiles", uid), {
    ...patch,
    updatedAt: Date.now(),
  });
};

export const upsertProfile = async (profile: StudentProfile) => {
  const fb = getFirebase();
  if (!fb) return;
  await setDoc(doc(fb.db, "profiles", profile.uid), {
    ...profile,
    updatedAt: Date.now(),
  });
};

export const uploadProfilePhoto = async (
  uid: string,
  file: File
): Promise<string> => {
  const fb = getFirebase();
  if (!fb) throw new Error("Firebase not configured");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
  const path = `users/${uid}/avatar/${Date.now()}_${safeName}`;
  const storageRef = ref(fb.storage, path);
  await uploadBytes(storageRef, file, {
    contentType: file.type || "image/jpeg",
  });
  return getDownloadURL(storageRef);
};
