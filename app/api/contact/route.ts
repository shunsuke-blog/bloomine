import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { category, subject, message } = await req.json();
    if (!message?.trim() || !subject?.trim()) {
      return NextResponse.json({ error: "件名と内容を入力してください" }, { status: 400 });
    }
    if (subject.length > 200) {
      return NextResponse.json({ error: "件名は200文字以内で入力してください" }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: "内容は5000文字以内で入力してください" }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: "bloomine <noreply@bloomines.com>",
      to: "bloomine.support@gmail.com",
      subject: `[お問い合わせ] ${subject.trim()}`,
      text: [
        `カテゴリ: ${category ?? "その他"}`,
        `送信者: ${user.email}`,
        `ユーザーID: ${user.id}`,
        "",
        "【内容】",
        message.trim(),
      ].join("\n"),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "サーバーエラーが発生しました";
    console.error("POST /api/contact error:", msg);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
