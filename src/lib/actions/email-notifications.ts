"use server";

import { revalidatePath } from "next/cache";
import { updateEmailNotificationPreference } from "@/lib/notifications/preferences";
import type { EmailNotificationPreferenceKey } from "@/types/email-notifications";

export async function updateEmailNotificationPreferenceAction(
  key: EmailNotificationPreferenceKey,
  enabled: boolean
) {
  const result = await updateEmailNotificationPreference(key, enabled);

  if ("success" in result) {
    revalidatePath("/menu/notifications");
  }

  return result;
}
