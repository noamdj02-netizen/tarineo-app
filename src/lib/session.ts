import { cache } from "react";
import { auth } from "@/auth";

/** Une seule lecture de session par requête serveur (layout + page). */
export const getSession = cache(auth);
