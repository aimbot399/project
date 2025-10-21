export type Category = 'dream' | 'visited' | 'planning';
export type Theme = 'pastel' | 'dark' | 'sunset';

export type DestinationWithNotes = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: Category;
  notes: {
    id: string;
    content: string;
    image_url: string | null;
    mood_tags: string[];
    created_at: string;
  }[];
};
