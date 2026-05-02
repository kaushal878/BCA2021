# BCA2021 — Batch Cloud

A free, open-source web app that gives the **BCA 2021 batch** a private cloud
to share photos, documents, syllabus, and notes. Each student gets a profile,
multi-file uploads with progress, drag &amp; drop, search, file previews, and
a directory of every batchmate.

## Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + React Router
- **Auth / Database / Storage**: Firebase (Auth, Firestore, Cloud Storage) — free tier
- **Hosting**: Vercel or Netlify (free tier) — Firebase Hosting also configured

Everything in this stack is free and open source.

## Folder structure

```
.
├── firebase/
│   ├── firestore.rules         # Firestore security rules
│   └── storage.rules           # Cloud Storage security rules
├── public/
│   └── favicon.svg
├── src/
│   ├── components/             # Layout, FileCard, UploadDropzone, Icons, ...
│   ├── context/                # AuthContext, ThemeContext
│   ├── lib/                    # firebase, files, profiles, students, types
│   ├── pages/                  # Home, Auth, Dashboard, Profile, Students, FileViewer
│   ├── App.tsx                 # Routes
│   └── main.tsx                # Providers + bootstrap
├── .env.example                # Firebase config keys (copy to `.env`)
├── firebase.json               # Firebase rules + Hosting config
├── netlify.toml                # SPA rewrites for Netlify
├── vercel.json                 # SPA rewrites for Vercel
├── tailwind.config.js
└── vite.config.ts
```

## Features

- **Auth**: Email / password and Google sign-in (Firebase Auth)
- **Profiles**: Avatar, name, registration number, bio — backed by Firestore
- **Multi-file uploads**: Drag &amp; drop or browse, with a per-file progress bar
- **Cloud storage**: Firebase Storage, files namespaced under `users/{uid}/…`
- **Categories**: Auto-detected (image / pdf / document / syllabus / other)
- **Search &amp; filters**: Across file name, owner, registration number, category
- **File viewer**: In-line preview for images and PDFs, download for everything
- **Owner-only delete &amp; edit**: Enforced both in UI and in Firestore rules
- **Student directory**: All 10 BCA 2021 students preseeded; each card links to
  their public profile + uploads
- **Theming**: Light / dark mode toggle, glassmorphism UI, fully responsive
- **Admin (optional)**: Set `VITE_ADMIN_EMAILS` to grant moderation power

## Quick start (local)

```bash
git clone https://github.com/kaushal878/BCA2021.git
cd BCA2021
cp .env.example .env            # then fill in Firebase values (see below)
npm install
npm run dev                     # http://localhost:5173
```

> The app boots even without Firebase configured — you'll see a banner and
> auth/upload features will be disabled until you add real credentials.

Useful scripts:

```bash
npm run dev        # local dev server (Vite)
npm run lint       # ESLint
npm run build      # type-check + production build → dist/
npm run preview    # preview the production build
```

## Firebase setup (free tier)

1. Go to <https://console.firebase.google.com> and **Create project**
   (free Spark plan is enough).
2. **Authentication** → **Sign-in method** → enable **Email/Password** and
   **Google**.
3. **Firestore Database** → **Create database** → start in *production mode*.
4. **Storage** → **Get started** → start in *production mode*.
5. **Project settings** (gear icon) → **Your apps** → **Web (`</>`)** → register
   the app, then copy the SDK config object. Paste each value into `.env`:

   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=1:...:web:...
   VITE_ADMIN_EMAILS=optional@example.com,another@example.com
   ```

6. **Authorized domains** — under Authentication → Settings → Authorized
   domains, add your dev/preview domains (e.g. `localhost`, your Vercel/Netlify
   subdomain) so Google sign-in works.
7. Deploy the security rules in this repo:

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add        # pick the project you just created
   firebase deploy --only firestore:rules,storage
   ```

   Rules live in `firebase/firestore.rules` and `firebase/storage.rules` — both
   require auth, restrict writes to the owning user, and cap uploads at 50 MB.

## Deploy

### Vercel (recommended)

1. Push this repo to GitHub.
2. Import it in <https://vercel.com/new>.
3. Framework preset: **Vite**, build command `npm run build`, output `dist`.
4. Project Settings → **Environment variables** — add every `VITE_FIREBASE_*`
   value from your `.env`. Redeploy.
5. `vercel.json` already configures SPA rewrites so `/dashboard` etc. won’t 404.

### Netlify

1. New site → **Import from Git** → pick this repo.
2. Build command `npm run build`, publish directory `dist`.
3. Site settings → **Environment variables** — add the `VITE_FIREBASE_*` keys.
4. `netlify.toml` already configures SPA rewrites.

### Firebase Hosting (alternative)

```bash
npm run build
firebase deploy --only hosting
```

## Initial students seed

The 10 BCA 2021 students are hard-coded in `src/lib/students.ts` so the
sidebar and directory always show the full batch — even before everyone has
registered. When a student signs up, picking their registration number wires
their Firebase user to the existing seed so their profile and uploads appear
on their card.

## Notes

- The free Firebase Spark plan is plenty for a class of 10 — 1 GiB Firestore,
  5 GiB Storage, 1 GiB egress/day. Uploads are capped at 50 MB per file in the
  Storage rules to make sure no one accidentally blows the daily quota.
- Files are stored under `users/{uid}/…` so deleting a user folder cleans up
  all of their uploads at once if needed.
