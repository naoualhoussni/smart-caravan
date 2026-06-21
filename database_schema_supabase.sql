-- Table des profils utilisateurs (Liée à auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'TRAINER' CHECK (role IN ('ADMIN', 'COORDINATOR', 'SUPERVISOR', 'TRAINER')),
  team_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des Caravanes
CREATE TABLE IF NOT EXISTS caravans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  province TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'ACTIVE', 'COMPLETED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des Équipes
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  caravan_id UUID REFERENCES caravans(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des Établissements
CREATE TABLE IF NOT EXISTS schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  province TEXT NOT NULL,
  commune TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED')),
  caravan_id UUID REFERENCES caravans(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des Activités (Tracking - Coordonnées GPS standards)
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- CHECK_IN, CHECK_OUT, MODULE_COMPLETED, PHOTO_UPLOAD
  content TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des Rapports
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'MANUAL',
  caravan_id UUID REFERENCES caravans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) - Exemple de base
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Note : Suppression et recréation propre des politiques pour éviter les doublons
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);
