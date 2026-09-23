import NextAuth, { CredentialsSignin } from "next-auth";
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

/** Compte créé via Google sans mot de passe local — message dédié sur /connexion. */
class ConnexionGoogleUniquement extends CredentialsSignin {
  code = "google_only";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/connexion",
    error: "/connexion",
  },
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
        // Select minimal — évite de charger tout le User + relations inutiles.
        const utilisateur = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            workspaceOwnerId: true,
            accounts: { where: { provider: "google" }, take: 1, select: { id: true } },
          },
        });
        if (!utilisateur) return null;

        if (!utilisateur.passwordHash) {
          if (utilisateur.accounts.length > 0) {
            throw new ConnexionGoogleUniquement();
          }
          return null;
        }

        const motDePasseValide = await verifierMotDePasse(password, utilisateur.passwordHash);
        if (!motDePasseValide) return null;

        return {
          id: utilisateur.id,
          email: utilisateur.email,
          name: utilisateur.name,
          workspaceOwnerId: utilisateur.workspaceOwnerId,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  events: {
    // Inscription Google : le PrismaAdapter crée le User sans passer par
    // creerCompte() — on horodate le consentement RGPD ici (équivalent email/mdp).
    async createUser({ user }) {
      if (!user.id) return;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          consentAt: new Date(),
          emailVerified: new Date(),
        },
      });
    },
  },
  callbacks: {
    // Bloque uniquement la CRÉATION de nouveaux comptes Google une fois l'accès
    // anticipé complet — jamais la connexion d'un compte déjà existant. On ne peut
    // pas se fier à account.isNewUser (pas encore déterminé à ce stade, avant
    // l'adapter) : on vérifie nous-mêmes si un User existe déjà pour cet email.
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) return true;

      const email = user.email.toLowerCase();
      const existant = await prisma.user.findUnique({
        where: { email },
        include: { accounts: { where: { provider: "google" } } },
      });

      if (existant) {
        if (!existant.emailVerified) {
          await prisma.user.update({
            where: { id: existant.id },
            data: { emailVerified: new Date() },
          });
        }
        // Compte email/mot de passe existant : on lie Google pour éviter la page
        // Auth.js par défaut (« sign in with the same account you used originally »).
        if (existant.accounts.length === 0 && account.providerAccountId) {
          await prisma.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            create: {
              userId: existant.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            },
            update: {
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
            },
          });
        }
        return true;
      }

      const total = await prisma.user.count();
      if (total >= ACCES_ANTICIPE_LIMITE_TOTAL) {
        return "/inscription?erreur=acces_complet";
      }
      return true;
    },
    async jwt({ token, user }) {
      // Connexion fraîche : on pose le JWT sans re-requête DB (authorize vient de le faire).
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        const ownerId = user.workspaceOwnerId ?? null;
        token.workspaceOwnerId = ownerId;
        token.donneesUserId = ownerId ?? user.id;
        token.checkedAt = Date.now();
        return token;
      }

      // Cookie JWT encore valide après reset DB / suppression / révocation équipe :
      // on revalide au plus toutes les 60 s (compromis perf vs isolation équipe).
      const STALE_MS = 60_000;
      const checkedAt = typeof token.checkedAt === "number" ? token.checkedAt : 0;
      const estFrais = Date.now() - checkedAt < STALE_MS;

      if (token.sub && !estFrais) {
        const existant = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { id: true, email: true, name: true, workspaceOwnerId: true },
        });
        if (!existant) {
          delete token.sub;
          return token;
        }
        token.email = existant.email;
        token.name = existant.name;
        token.workspaceOwnerId = existant.workspaceOwnerId;
        token.donneesUserId = existant.workspaceOwnerId ?? existant.id;
        token.checkedAt = Date.now();
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        if (token.email) session.user.email = token.email;
        if (token.name) session.user.name = token.name;
        session.user.workspaceOwnerId =
          typeof token.workspaceOwnerId === "string" ? token.workspaceOwnerId : null;
        session.user.donneesUserId =
          typeof token.donneesUserId === "string" ? token.donneesUserId : token.sub;
      }
      return session;
    },
  },
});
