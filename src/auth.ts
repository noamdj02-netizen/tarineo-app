import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifierMotDePasse } from "@/lib/password";
import { ACCES_ANTICIPE_LIMITE_TOTAL } from "@/lib/accesAnticipe";

const schemaIdentifiants = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Le flux Credentials d'Auth.js encode toujours la session en JWT, quelle que
  // soit la stratégie configurée (vérifié dans @auth/core/lib/actions/callback :
  // adapter.createSession n'est jamais appelé pour ce provider). Avec strategy:
  // "database", les connexions par mot de passe recevraient un cookie que le
  // reste de l'app ne saurait pas relier à une session — d'où "jwt" ici, pour
  // Credentials et Google. La table Session n'est donc plus utilisée.
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(raw) {
        const parsed = schemaIdentifiants.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const utilisateur = await prisma.user.findUnique({ where: { email } });
        if (!utilisateur?.passwordHash) return null;

        const motDePasseValide = await verifierMotDePasse(password, utilisateur.passwordHash);
        if (!motDePasseValide) return null;

        return { id: utilisateur.id, email: utilisateur.email, name: utilisateur.name };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    // Bloque uniquement la CRÉATION de nouveaux comptes Google une fois l'accès
    // anticipé complet — jamais la connexion d'un compte déjà existant. On ne peut
    // pas se fier à account.isNewUser (pas encore déterminé à ce stade, avant
    // l'adapter) : on vérifie nous-mêmes si un User existe déjà pour cet email.
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) return true;

      const existant = await prisma.user.findUnique({ where: { email: user.email } });
      if (existant) return true;

      const total = await prisma.user.count();
      if (total >= ACCES_ANTICIPE_LIMITE_TOTAL) {
        return "/inscription?erreur=acces_complet";
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        if (token.email) session.user.email = token.email;
        if (token.name) session.user.name = token.name;
      }
      return session;
    },
  },
});
