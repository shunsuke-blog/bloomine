import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const displayName =
        data.user.user_metadata?.display_name ??
        data.user.email?.split("@")[0] ??
        "ゲスト";

      // INSERT を試みて成功した場合のみ新規登録として通知
      const { error: insertError } = await supabase
        .from("user_profiles")
        .insert({ id: data.user.id, display_name: displayName });

      if (!insertError) {
        // 新規ユーザー：通知メールを送信
        const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
        await resend.emails.send({
          from: "bloomine <noreply@bloomines.com>",
          to: "bloomine.support@gmail.com",
          subject: `[新規登録] ${displayName}さんが登録しました`,
          text: [
            `新規ユーザーが登録しました。`,
            ``,
            `名前: ${displayName}`,
            `メール: ${data.user.email}`,
            `ユーザーID: ${data.user.id}`,
            `登録日時: ${now}`,
          ].join("\n"),
        });
      }

      return NextResponse.redirect(new URL("/", origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth_failed", origin));
}
