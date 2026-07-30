import { EmailNotificationSettingsPage } from "@/components/menu/EmailNotificationSettings";
import { getEmailNotificationPreferencesForCurrentUser } from "@/lib/notifications/preferences";
import { DEFAULT_EMAIL_NOTIFICATION_PREFERENCES } from "@/types/email-notifications";

export default async function MenuNotificationsPage() {
  const result = await getEmailNotificationPreferencesForCurrentUser();
  const preferences =
    "error" in result ? DEFAULT_EMAIL_NOTIFICATION_PREFERENCES : result;

  return <EmailNotificationSettingsPage preferences={preferences} />;
}
