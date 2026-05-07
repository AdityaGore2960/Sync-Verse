# SyncVerse Fixes - Progress Tracker

## Completed (0/18)

## In Progress

## Pending Steps

### 1. Setup Configs ✓
- [x] Create `.env.example`
- [ ] (User: Copy to `.env`, set MONGO_URI/JWT_SECRET)

### 2. Cleanup Cruft
- [x] Clean `client/src/App.css` (remove Vite template CSS)
- [x] Fix typo in `controllers/document.controller.js` ('lockedByBy')
- [x] Delete `signup-api-demo/` dir

### 3. Fix ESLint Errors (8 total)
- [x] DocumentRow.jsx: Remove unused `onRename`
- [x] StarButton.jsx: Fix unused `user`
- [x] MyDocuments.jsx: Fix unused `user`
- [x] AuthContext.jsx: Fix setState in useEffect + react-refresh
- [x] DocumentsContext.jsx: react-refresh (extract utils)
- [x] ThemeContext.jsx: react-refresh (extract utils)
- [ ] Editor.jsx: exhaustive-deps warning (ref cleanup)

### 4. Runtime Checks
- [x] Run `npm install-all` (used --legacy-peer-deps for React 19/react-quill compat)
- [ ] Run `npm run lint --prefix client` (0 errors)
- [ ] Run `npm run dev` (server + client)
- [ ] Test: Register/login/create doc/editor

### 5. Polish
- [ ] Update TODO.md after each batch

**Progress: Update this file after each step completed.**
