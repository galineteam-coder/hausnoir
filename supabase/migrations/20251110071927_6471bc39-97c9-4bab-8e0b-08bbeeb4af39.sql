-- Allow authenticated users to insert games (for favorites)
CREATE POLICY "Authenticated users can insert games"
ON public.games
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create leaderboard table for mini-game scores
CREATE TABLE public.leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN ('reaction', 'pattern', 'memory', 'spatial', 'verbal', 'multitask')),
  score NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  username TEXT
);

-- Enable RLS on leaderboard
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view leaderboard
CREATE POLICY "Anyone can view leaderboard"
ON public.leaderboard
FOR SELECT
USING (true);

-- Allow authenticated users to insert their own scores
CREATE POLICY "Users can insert own scores"
ON public.leaderboard
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create index for better leaderboard query performance
CREATE INDEX idx_leaderboard_game_score ON public.leaderboard(game_type, score DESC);
CREATE INDEX idx_leaderboard_created_at ON public.leaderboard(created_at DESC);