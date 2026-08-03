import { config } from "dotenv";
import { sendFeedbackEmail } from "../src/lib/feedback/send-feedback-email";

config({ path: ".env.local" });

async function main() {
  const result = await sendFeedbackEmail({
    category: "idea",
    message:
      "これはフィードバック送信テストです。\n\n本文がメールに含まれているか確認してください。",
    memberName: "Resono Test",
    memberEmail: "test@resono.band",
    memberId: "test-member",
  });

  if ("error" in result && result.error) {
    console.error("Failed:", result.error);
    process.exit(1);
  }

  console.log("Feedback test email sent successfully.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
