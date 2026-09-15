-- Active la Row Level Security sur les tables Auth.js, sans policy associée.
-- Prisma se connecte via le rôle admin du pooler Supabase (bypass RLS), donc
-- ceci ne change rien côté application : ça bloque uniquement l'accès public
-- à ces tables via l'API REST/GraphQL auto-générée de Supabase (PostgREST),
-- qui respecte RLS pour les rôles "anon"/"authenticated".
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
