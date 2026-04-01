-- ═══════════════════════════════════════════════════════════════════
-- Momentum Habit OS — FULL DATA SCHEMA (Run in Supabase SQL Editor)
-- Run this AFTER the original supabase_schema.sql
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Habits Table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.habits (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'Personal',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own habits" ON public.habits;
CREATE POLICY "own habits" ON public.habits
  FOR ALL USING (auth.uid() = user_id);

-- ── 2. Habit Logs Table (one row per completion per day) ──────────
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id     UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  completed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(habit_id, completed_at)
);

ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own logs" ON public.habit_logs;
CREATE POLICY "own logs" ON public.habit_logs
  FOR ALL USING (auth.uid() = user_id);

-- ── 3. Goals Table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.goals (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'Personal',
  deadline    BIGINT NOT NULL DEFAULT 0,
  progress    INTEGER NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'In Progress',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own goals" ON public.goals;
CREATE POLICY "own goals" ON public.goals
  FOR ALL USING (auth.uid() = user_id);

-- ── 4. Extend profiles with XP / Level / Streak columns ───────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS xp               INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level            INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS current_streak   INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak   INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_date DATE;

-- ── 5. Fix profile UPDATE policy (add WITH CHECK) ─────────────────
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── 6. Update trigger to safely upsert profile on new user ────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
