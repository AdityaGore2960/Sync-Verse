import { useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { DocumentsContext } from './DocumentsContextModel.js';

/**
 * DocumentsProvider: Centralized state for all document-related operations.
 */
export function DocumentsProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [sharedWithMe, setSharedWithMe] = useState([]);
  const [sharedByMe, setSharedByMe] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch documents owned by user
  const fetchDocuments = useCallback(async (search = '') => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get(`/documents?search=${search}`);
      setDocuments(res.data.documents);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch docs shared WITH user
  const fetchSharedWithMe = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/documents/shared-with-me');
      setSharedWithMe(res.data.documents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch docs shared BY user
  const fetchSharedByMe = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/documents/shared-by-me');
      setSharedByMe(res.data.documents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch favorites
  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/users/favorites');
      setFavorites(res.data.documents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch when user logs in
  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchSharedWithMe();
      fetchSharedByMe();
      fetchFavorites();
    } else {
      setDocuments([]);
      setSharedWithMe([]);
      setSharedByMe([]);
      setFavorites([]);
    }
  }, [user, fetchDocuments, fetchSharedWithMe, fetchSharedByMe, fetchFavorites]);

  const toggleFavorite = useCallback(async (docId) => {
    if (!user) return;

    // Determine existing state from favorites list
    const isAlreadyFavorited = favorites.some(d => d._id === docId);

    // Optimistic UI updates
    if (isAlreadyFavorited) {
      setFavorites(prev => prev.filter(d => d._id !== docId));
    } else {
      // Find the document in other lists to add it to favorites
      const docToAdd = [...documents, ...sharedWithMe, ...sharedByMe].find(d => d._id === docId);
      if (docToAdd) {
        setFavorites(prev => [docToAdd, ...prev]);
      }
    }

    try {
      await api.patch(`/users/favorites/${docId}`);
    } catch (err) {
      console.error('Failed to toggle favorite', err);
      // Revert on error
      fetchFavorites();
    }
  }, [user, favorites, documents, sharedWithMe, sharedByMe, fetchFavorites]);

  const addDocument = useCallback((newDoc) => {
    setDocuments((prev) => [newDoc, ...prev]);
  }, []);

  const deleteDocument = useCallback((id) => {
    setDocuments((prev) => prev.filter((doc) => doc._id !== id));
    setSharedByMe((prev) => prev.filter((doc) => doc._id !== id));
    setSharedWithMe((prev) => prev.filter((doc) => doc._id !== id));
    setFavorites((prev) => prev.filter((doc) => doc._id !== id));
  }, []);

  const updateDocument = useCallback((updatedDoc) => {
    const update = (prev) => prev.map((doc) => (doc._id === updatedDoc._id ? updatedDoc : doc));
    setDocuments(update);
    setSharedWithMe(update);
    setSharedByMe(update);
  }, []);

  const duplicateDocument = useCallback(async (id) => {
    if (!user) return null;
    try {
      const res = await api.post(`/documents/${id}/duplicate`);
      const newDoc = res.data.document;
      addDocument(newDoc);
      return newDoc;
    } catch (err) {
      console.error('Failed to duplicate document', err);
      throw err;
    }
  }, [user, addDocument]);

  const createDocument = useCallback(async (formData) => {
    if (!user) return null;
    try {
      const res = await api.post('/documents', formData);
      const newDoc = res.data.document; // Assuming the response has the document
      addDocument(newDoc);
      return newDoc;
    } catch (err) {
      console.error('Failed to create document', err);
      throw err;
    }
  }, [user, addDocument]);

  const value = {
    documents,
    sharedWithMe,
    sharedByMe,
    favorites,
    loading,
    error,
    fetchDocuments,
    fetchSharedWithMe,
    fetchSharedByMe,
    fetchFavorites,
    toggleFavorite,
    createDocument,
    addDocument,
    deleteDocument,
    updateDocument,
    duplicateDocument,
  };

  return (
    <DocumentsContext.Provider value={value}>
      {children}
    </DocumentsContext.Provider>
  );
}
