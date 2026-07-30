import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/auth";
import { getMemberByUserId } from "@/lib/members";
import type {
  EmailNotificationPreferenceKey,
  EmailNotificationPreferences,
} from "@/types/email-notifications";
import { DEFAULT_EMAIL_NOTIFICATION_PREFERENCES } from "@/types/email-notifications";

function rowToPreferences(row: {
  resonance_members: boolean;
  messages: boolean;
  band_recruitment: boolean;
}): EmailNotificationPreferences {
  return {
    resonanceMembers: row.resonance_members,
    messages: row.messages,
    bandRecruitment: row.band_recruitment,
  };
}

export async function getEmailNotificationPreferencesForMember(
  memberId: string
): Promise<EmailNotificationPreferences> {
  const admin = createAdminClient();
  if (!admin) {
    return DEFAULT_EMAIL_NOTIFICATION_PREFERENCES;
  }

  const { data, error } = await admin
    .from("email_notification_preferences")
    .select("resonance_members, messages, band_recruitment")
    .eq("member_id", memberId)
    .maybeSingle();

  if (error) {
    console.error("[EmailPrefs] lookup:", error.message);
    return DEFAULT_EMAIL_NOTIFICATION_PREFERENCES;
  }

  if (!data) {
    return DEFAULT_EMAIL_NOTIFICATION_PREFERENCES;
  }

  return rowToPreferences(data);
}

export async function isEmailNotificationEnabled(
  memberId: string,
  key: EmailNotificationPreferenceKey
): Promise<boolean> {
  const prefs = await getEmailNotificationPreferencesForMember(memberId);
  return prefs[key];
}

export async function getEmailNotificationPreferencesForCurrentUser(): Promise<
  EmailNotificationPreferences | { error: string }
> {
  const user = await getAuthUser();
  if (!user) {
    return { error: "ログインが必要です" };
  }

  const member = await getMemberByUserId(user.id);
  if (!member) {
    return { error: "プロフィールが見つかりません" };
  }

  return getEmailNotificationPreferencesForMember(member.id);
}

export async function updateEmailNotificationPreference(
  key: EmailNotificationPreferenceKey,
  enabled: boolean
): Promise<{ success: true } | { error: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { error: "ログインが必要です" };
  }

  const member = await getMemberByUserId(user.id);
  if (!member) {
    return { error: "プロフィールが見つかりません" };
  }

  const supabase = await createClient();
  const current = await getEmailNotificationPreferencesForMember(member.id);

  const { error } = await supabase.from("email_notification_preferences").upsert(
    {
      member_id: member.id,
      resonance_members:
        key === "resonanceMembers" ? enabled : current.resonanceMembers,
      messages: key === "messages" ? enabled : current.messages,
      band_recruitment:
        key === "bandRecruitment" ? enabled : current.bandRecruitment,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "member_id" }
  );

  if (error) {
    console.error("[EmailPrefs] update:", error.message);
    return { error: "設定の保存に失敗しました" };
  }

  return { success: true };
}
