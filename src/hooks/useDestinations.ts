import { useState, useEffect } from 'react';
import type { DestinationWithNotes } from '../types';

const STORAGE_KEY = 'journey_map_data';

export function useDestinations() {
  const [destinations, setDestinations] = useState<DestinationWithNotes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDestinations();
  }, []);

  function loadDestinations() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setDestinations(data);
      }
    } catch (error) {
      console.error('Error loading destinations:', error);
    } finally {
      setLoading(false);
    }
  }

  function saveDestinations(dests: DestinationWithNotes[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dests));
    } catch (error) {
      console.error('Error saving destinations:', error);
    }
  }

  async function addDestination(
    name: string,
    latitude: number,
    longitude: number,
    category: 'dream' | 'visited' | 'planning'
  ) {
    try {
      const newDest: DestinationWithNotes = {
        id: crypto.randomUUID(),
        name,
        latitude,
        longitude,
        category,
        notes: [],
      };

      setDestinations((prev) => {
        const updated = [newDest, ...prev];
        saveDestinations(updated);
        return updated;
      });
      return newDest;
    } catch (error) {
      console.error('Error adding destination:', error);
      return null;
    }
  }

  async function deleteDestination(id: string) {
    try {
      setDestinations((prev) => {
        const updated = prev.filter((d) => d.id !== id);
        saveDestinations(updated);
        return updated;
      });
    } catch (error) {
      console.error('Error deleting destination:', error);
    }
  }

  async function addNote(
    destinationId: string,
    content: string,
    moodTags: string[] = [],
    imageUrl: string | null = null
  ) {
    try {
      const newNote = {
        id: crypto.randomUUID(),
        content,
        image_url: imageUrl,
        mood_tags: moodTags,
        created_at: new Date().toISOString(),
      };

      setDestinations((prev) => {
        const updated = prev.map((dest) =>
          dest.id === destinationId
            ? {
                ...dest,
                notes: [newNote, ...dest.notes],
              }
            : dest
        );
        saveDestinations(updated);
        return updated;
      });
      
      return newNote as DestinationWithNotes['notes'][number];
    } catch (error) {
      console.error('Error adding note:', error);
      return null;
    }
  }

  async function deleteNote(destinationId: string, noteId: string) {
    try {
      setDestinations((prev) => {
        const updated = prev.map((dest) =>
          dest.id === destinationId
            ? {
                ...dest,
                notes: dest.notes.filter((n) => n.id !== noteId),
              }
            : dest
        );
        saveDestinations(updated);
        return updated;
      });
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }

  return {
    destinations,
    loading,
    addDestination,
    deleteDestination,
    addNote,
    deleteNote,
  };
}
