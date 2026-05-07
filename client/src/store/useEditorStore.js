import { create } from 'zustand';

export const useEditorStore = create((set) => ({
  title: 'Untitled Document',
  saveStatus: 'saved', // 'saved', 'saving', 'unsaved'
  isStarred: false,
  documentId: null,
  access: 'editor',
  collaborators: [],
  documentMetadata: null,

  setTitle: (title) => set({ title }),
  setSaveStatus: (status) => set({ saveStatus: status }),
  setIsStarred: (isStarred) => set({ isStarred }),
  setDocumentId: (id) => set({ documentId: id }),
  setAccess: (access) => set({ access }),
  followingId: null,
  setCollaborators: (collabs) => set({ collaborators: collabs }),
  setFollowingId: (id) => set({ followingId: id }),
  setDocumentMetadata: (metadata) => set({ documentMetadata: metadata }),

  updateCollaborator: (user) => set((state) => ({
    collaborators: [...state.collaborators.filter(u => u.id !== user.id), user]
  })),

  removeCollaborator: (userId) => set((state) => ({
    collaborators: state.collaborators.filter(u => u.id !== userId)
  })),
}));
