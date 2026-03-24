import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
    const displayName = user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "ゲスト";

    await resend.emails.send({
      from: "bloomine <noreply@bloomines.com>",
      to: "bloomine.support@gmail.com",
      subject: `[新規登録] ${displayName}さんが登録しました`,
      text: [
        `新規ユーザーが登録しました。`,
        ``,
        `名前: ${displayName}`,
        `メール: ${user.email}`,
        `ユーザーID: ${user.id}`,
        `登録日時: ${now}`,
      ].join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
