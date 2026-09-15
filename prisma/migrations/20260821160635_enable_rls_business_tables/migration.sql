-- Active la Row Level Security sur les tables métier, sans policy associée.
-- Prisma se connecte via le rôle admin du pooler Supabase (bypass RLS), donc
-- ceci ne change rien côté application : ça bloque uniquement l'accès public
-- à ces tables via l'API REST/GraphQL auto-générée de Supabase (PostgREST),
-- qui respecte RLS pour les rôles "anon"/"authenticated".
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LineItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PriceHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClientQuote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Alert" ENABLE ROW LEVEL SECURITY;
