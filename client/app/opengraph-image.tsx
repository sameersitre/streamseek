import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "StreamSeek — Movie & TV Show Discovery";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(228,110,54,0.06) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Accent glow */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-50px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            display: "flex",
            background:
              "radial-gradient(circle, rgba(228,110,54,0.15) 0%, transparent 70%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            zIndex: 1,
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              backgroundColor: "#E46E36",
              fontSize: "36px",
              fontWeight: 700,
              color: "#0a0a0a",
            }}
          >
            SS
          </div>

          {/* App name */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-1px",
              display: "flex",
            }}
          >
            StreamSeek
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 28,
              color: "#a1a1aa",
              display: "flex",
            }}
          >
            Discover Movies & TV Shows
          </div>

          {/* Feature tags */}
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            {["Trending", "Trailers", "Where to Stream"].map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 18,
                  color: "#E46E36",
                  backgroundColor: "rgba(228,110,54,0.1)",
                  border: "1px solid rgba(228,110,54,0.2)",
                  padding: "6px 16px",
                  borderRadius: "9999px",
                  display: "flex",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Domain */}
          <div
            style={{
              fontSize: 18,
              color: "#71717a",
              marginTop: "4px",
              display: "flex",
            }}
          >
            streamseek.sameersitre.dev
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
