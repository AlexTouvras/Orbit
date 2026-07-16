import { ImageResponse } from "next/og";
import { getEditableProfile } from "@/lib/profile-store";

export const runtime = "nodejs";
export const alt = "Orbit — personal portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const profile = getEditableProfile();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background:
            "linear-gradient(145deg, #0a0e1a 0%, #0c1224 55%, #0a1628 100%)",
          color: "#f1f5f9",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "0.2em",
            color: "#e2e8f0",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              border: "2px solid #22d3ee",
              transform: "rotate(45deg)",
            }}
          />
          ORBIT.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: "#ffffff",
            }}
          >
            {profile.name}
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#22d3ee",
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            {profile.role}
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#94a3b8",
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            {profile.pillars}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 20,
            color: "#64748b",
            letterSpacing: "0.08em",
          }}
        >
          Delivery · Data · AI automation
        </div>
      </div>
    ),
    { ...size },
  );
}
