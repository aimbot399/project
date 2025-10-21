/*
  # Travel Journal Map Database Schema

  ## Overview
  Creates tables for storing travel destinations and associated notes with mood categories.
  
  ## New Tables
  
  ### `destinations`
  - `id` (uuid, primary key) - Unique identifier for each destination
  - `user_id` (uuid) - Reference to authenticated user (future-proofing for auth)
  - `name` (text) - Name of the destination
  - `latitude` (numeric) - Latitude coordinate
  - `longitude` (numeric) - Longitude coordinate
  - `category` (text) - Category type: 'dream', 'visited', or 'planning'
  - `created_at` (timestamptz) - Timestamp of creation
  - `updated_at` (timestamptz) - Timestamp of last update
  
  ### `notes`
  - `id` (uuid, primary key) - Unique identifier for each note
  - `destination_id` (uuid, foreign key) - Links to parent destination
  - `content` (text) - The note text content
  - `image_url` (text, optional) - URL to associated image
  - `mood_tags` (text array) - Array of mood descriptors
  - `created_at` (timestamptz) - Timestamp of creation
  
  ## Security
  - Enable RLS on both tables
  - Allow public access for demo purposes (can be restricted later with auth)
  - Add policies for authenticated users when auth is implemented
  
  ## Notes
  - Categories determine pin colors on the map
  - Mood tags enable filtering and visual themes
  - Timestamps enable chronological sorting
*/

-- Create destinations table
CREATE TABLE IF NOT EXISTS destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  category text NOT NULL DEFAULT 'planning',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_category CHECK (category IN ('dream', 'visited', 'planning'))
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id uuid NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  image_url text,
  mood_tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo mode)
CREATE POLICY "Allow public read access to destinations"
  ON destinations FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to destinations"
  ON destinations FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update to destinations"
  ON destinations FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to destinations"
  ON destinations FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to notes"
  ON notes FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to notes"
  ON notes FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update to notes"
  ON notes FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to notes"
  ON notes FOR DELETE
  TO anon
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);
CREATE INDEX IF NOT EXISTS idx_notes_destination_id ON notes(destination_id);
CREATE INDEX IF NOT EXISTS idx_destinations_created_at ON destinations(created_at DESC);