import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const flowerName = searchParams.get("flower_name");
  const level = searchParams.get("level");

  if (!flowerName) {
    return new Response("flower_name is required", { status: 400 });
  }

  const fontData = await fetch(
    new URL("/NotoSansJP-Regular.ttf", request.url)
  ).then((r) => r.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1a2744 50%, #0f2a1a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "NotoSansJP",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* ロゴ */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}>
          <span style={{ fontSize: "28px", color: "#6ee7b7", letterSpacing: "4px", fontWeight: 300 }}>
            🌸 bloomine
          </span>
        </div>

        {/* メインテキスト */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "22px", color: "#94a3b8", letterSpacing: "2px" }}>
            AIが見つけた私の強みは
          </span>
          <div
            style={{
              background: "rgba(52,211,153,0.1)",
              border: "1px solid rgba(52,211,153,0.3)",
              borderRadius: "16px",
              padding: "24px 48px",
              marginTop: "8px",
            }}
          >
            <span style={{ fontSize: "42px", color: "#6ee7b7", fontWeight: 400, letterSpacing: "2px" }}>
              「{flowerName}」
            </span>
          </div>
          {level && (
            <span style={{ fontSize: "16px", color: "#059669", marginTop: "8px" }}>
              Lv.{level}
            </span>
          )}
        </div>

        {/* 区切り線 */}
        <div
          style={{
            width: "200px",
            height: "1px",
            background: "rgba(52,211,153,0.2)",
            margin: "36px 0",
          }}
        />

        {/* 説明文 */}
        <span style={{ fontSize: "18px", color: "#64748b", letterSpacing: "1px", textAlign: "center" }}>
          毎日のジャーナリングから、AIが発見しました
        </span>

        {/* URL */}
        <div style={{ position: "absolute", bottom: "40px", right: "60px", display: "flex" }}>
          <span style={{ fontSize: "14px", color: "#334155", letterSpacing: "1px" }}>
            lp01.bloomines.com
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "NotoSansJP",
          data: fontData,
          style: "normal",
        },
      ],
    }
  );
}
