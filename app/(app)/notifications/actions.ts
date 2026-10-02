"use server";

import { revalidatePath } from "next/cache";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications/service";

function refresh() {
  revalidatePath("/notifications");
  revalidatePath("/accueil");
  revalidatePath("/", "layout");
}

export async function markNotificationReadAction(id: string) {
  await markNotificationRead(id);
  refresh();
}

export async function markAllNotificationsReadAction() {
  await markAllNotificationsRead();
  refresh();
}
