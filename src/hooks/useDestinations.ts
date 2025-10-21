import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { DestinationWithNotes } from '../types';

export function useDestinations() {
  const [destinations, setDestinations] = useState<DestinationWithNotes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDestinations();
  }, []);

  async function loadDestinations() {
    try {
      const { data: destData, error: destError } = await supabase
        .from('destinations')
        .select('*')
        .order('created_at', { ascending: false });

      if (destError) throw destError;

      const destinationsWithNotes: DestinationWithNotes[] = await Promise.all(
        (destData || []).map(async (dest) => {
          const { data: notesData } = await supabase
            .from('notes')
            .select('*')
            .eq('destination_id', dest.id)
            .order('created_at', { ascending: false });

          return {
            id: dest.id,
            name: dest.name,
            latitude: dest.latitude,
            longitude: dest.longitude,
            category: dest.category,
            notes: notesData || [],
          };
        })
      );

      setDestinations(destinationsWithNotes);
    } catch (error) {
      console.error('Error loading destinations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addDestination(
    name: string,
    latitude: number,
    longitude: number,
    category: 'dream' | 'visited' | 'planning'
  ) {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .insert([{ name, latitude, longitude, category }])
        .select()
        .single();

      if (error) throw error;

      const newDest: DestinationWithNotes = {
        id: data.id,
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        category: data.category,
        notes: [],
      };

      setDestinations((prev) => [newDest, ...prev]);
      return newDest;
    } catch (error) {
      console.error('Error adding destination:', error);
      return null;
    }
  }

  async function deleteDestination(id: string) {
    try {
      const { error } = await supabase
        .from('destinations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDestinations((prev) => prev.filter((d) => d.id !== id));
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
      const { data, error } = await supabase
        .from('notes')
        .insert([{ destination_id: destinationId, content, mood_tags: moodTags, image_url: imageUrl }])
        .select()
        .single();

      if (error) throw error;

      setDestinations((prev) =>
        prev.map((dest) =>
          dest.id === destinationId
            ? {
                ...dest,
                notes: [
                  {
                    id: data.id,
                    content: data.content,
                    image_url: data.image_url,
                    mood_tags: data.mood_tags,
                    created_at: data.created_at,
                  },
                  ...dest.notes,
                ],
              }
            : dest
        )
      );
      return {
        id: data.id,
        content: data.content,
        image_url: data.image_url,
        mood_tags: data.mood_tags,
        created_at: data.created_at,
      } as DestinationWithNotes['notes'][number];
    } catch (error) {
      console.error('Error adding note:', error);
      return null;
    }
  }

  async function deleteNote(destinationId: string, noteId: string) {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setDestinations((prev) =>
        prev.map((dest) =>
          dest.id === destinationId
            ? {
                ...dest,
                notes: dest.notes.filter((n) => n.id !== noteId),
              }
            : dest
        )
      );
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
    refresh: loadDestinations,
  };
}
