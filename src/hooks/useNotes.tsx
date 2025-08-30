import { useState, useEffect, useCallback } from 'react';
import { apiClient, Note } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useNotes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchNotes = useCallback(async () => {
    if (!user?._id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.getNotes();
      // The API returns { notes: [...], userId: "...", count: 1 }
      // So we need to extract the notes array from the response
      const fetchedNotes = response.notes || [];
      setNotes(fetchedNotes);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch notes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?._id, toast]);

  const createNote = useCallback(async (title: string, content: string) => {
    if (!user?._id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const newNote = await apiClient.createNote({ title, content });
      setNotes(prev => [newNote, ...prev]);
      toast({
        title: "Success!",
        description: "Note created successfully!",
      });
      return newNote;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create note",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [user?._id, toast]);

  const updateNote = useCallback(async (id: string, title: string, content: string) => {
    if (!user?._id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const updatedNote = await apiClient.updateNote(id, { title, content });
      setNotes(prev => prev.map(note => 
        note._id === id ? updatedNote : note
      ));
      toast({
        title: "Success!",
        description: "Note updated successfully!",
      });
      return updatedNote;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update note",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [user?._id, toast]);

  const deleteNote = useCallback(async (id: string) => {
    if (!user?._id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await apiClient.deleteNote(id);
      setNotes(prev => prev.filter(note => note._id !== id));
      toast({
        title: "Success!",
        description: "Note deleted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete note",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [user?._id, toast]);

  useEffect(() => {
    if (user?._id) {
      fetchNotes();
    }
  }, [user?._id, fetchNotes]);

  return {
    notes,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
  };
};
