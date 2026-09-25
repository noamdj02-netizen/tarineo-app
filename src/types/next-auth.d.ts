import "next-auth";

declare module "next-auth" {
  interface User {
    workspaceOwnerId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      /** Propriétaire de l'espace métier (membre d'équipe). */
      workspaceOwnerId?: string | null;
      /** ID à utiliser pour les requêtes documents/devis (owner si membre). */
      donneesUserId: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    workspaceOwnerId?: string | null;
    donneesUserId?: string;
    /** Epoch ms — dernière revalidation User en base (throttle JWT). */
    checkedAt?: number;
  }
}
