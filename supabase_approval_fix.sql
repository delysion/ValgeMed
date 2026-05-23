-- ⚠️ ESEGUI QUESTO FILE NEL SUPABASE SQL EDITOR
-- https://supabase.com → Dashboard → Project → SQL Editor

-- 1. Aggiunge colonna email se manca
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Aggiunge colonne approval se mancano
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;

-- 3. Imposta approved=false per i profili esistenti che hanno NULL
UPDATE profiles SET approved = false WHERE approved IS NULL;
UPDATE profiles SET is_admin = false WHERE is_admin IS NULL;

-- 4. Ricrea trigger che crea profilo alla registrazione
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE SET email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
