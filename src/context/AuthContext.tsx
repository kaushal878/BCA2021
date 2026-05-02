import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getFirebase, isAdminEmail, isFirebaseConfigured } from "../lib/firebase";
import type { StudentProfile } from "../lib/types";
import { findSeedByReg } from "../lib/students";

type AuthContextValue = {
  user: User | null;
  profile: StudentProfile | null;
  loading: boolean;
  configured: boolean;
  isAdmin: boolean;
  registerWithEmail: (input: {
    email: string;
    password: string;
    name: string;
    regNumber: string;
  }) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (regNumber?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildProfile = (
  user: User,
  overrides: Partial<StudentProfile>
): StudentProfile => {
  const seed = overrides.regNumber ? findSeedByReg(overrides.regNumber) : null;
  const name =
    overrides.name ?? seed?.name ?? user.displayName ?? user.email ?? "Student";
  return {
    uid: user.uid,
    email: user.email ?? overrides.email ?? "",
    name,
    regNumber: overrides.regNumber ?? seed?.regNumber ?? "",
    photoURL: overrides.photoURL ?? user.photoURL ?? null,
    bio: overrides.bio ?? null,
    slug: seed?.slug ?? slugify(name),
    createdAt: overrides.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseConfigured;

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    const fb = getFirebase();
    if (!fb) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(fb.auth, async (u) => {
      setUser(u);
      if (u) {
        const ref = doc(fb.db, "profiles", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfile(snap.data() as StudentProfile);
        } else {
          // No profile yet — create a stub from auth metadata.
          const stub = buildProfile(u, {});
          await setDoc(ref, { ...stub, _createdAt: serverTimestamp() });
          setProfile(stub);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [configured]);

  const refreshProfile = useCallback(async () => {
    const fb = getFirebase();
    if (!fb || !user) return;
    const snap = await getDoc(doc(fb.db, "profiles", user.uid));
    if (snap.exists()) setProfile(snap.data() as StudentProfile);
  }, [user]);

  const registerWithEmail: AuthContextValue["registerWithEmail"] = async ({
    email,
    password,
    name,
    regNumber,
  }) => {
    const fb = getFirebase();
    if (!fb) throw new Error("Firebase not configured");
    const cred = await createUserWithEmailAndPassword(fb.auth, email, password);
    if (name) await updateProfile(cred.user, { displayName: name });
    const data = buildProfile(cred.user, { name, regNumber, email });
    await setDoc(doc(fb.db, "profiles", cred.user.uid), {
      ...data,
      _createdAt: serverTimestamp(),
    });
    setProfile(data);
  };

  const loginWithEmail: AuthContextValue["loginWithEmail"] = async (
    email,
    password
  ) => {
    const fb = getFirebase();
    if (!fb) throw new Error("Firebase not configured");
    await signInWithEmailAndPassword(fb.auth, email, password);
  };

  const loginWithGoogle: AuthContextValue["loginWithGoogle"] = async (
    regNumber
  ) => {
    const fb = getFirebase();
    if (!fb) throw new Error("Firebase not configured");
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(fb.auth, provider);
    if (regNumber) {
      const ref = doc(fb.db, "profiles", cred.user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        const seed = findSeedByReg(regNumber);
        const data = buildProfile(cred.user, {
          regNumber,
          name: seed?.name ?? cred.user.displayName ?? "Student",
        });
        await setDoc(ref, { ...data, _createdAt: serverTimestamp() });
        setProfile(data);
      }
    }
  };

  const logout = async () => {
    const fb = getFirebase();
    if (!fb) return;
    await signOut(fb.auth);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      configured,
      isAdmin: isAdminEmail(user?.email ?? null),
      registerWithEmail,
      loginWithEmail,
      loginWithGoogle,
      refreshProfile,
      logout,
    }),
    [user, profile, loading, configured, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
