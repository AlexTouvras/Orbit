import type { CSSProperties, ReactElement } from "react";

export const OG_SIZE = { width: 1200, height: 630 } as const;

const shellStyle: CSSProperties = {
  height: "100%",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "64px 72px",
  background: "linear-gradient(145deg, #0a0e1a 0%, #0c1224 55%, #0a1628 100%)",
  color: "#f1f5f9",
  fontFamily: "system-ui, sans-serif",
};

function OrbitMark() {
  return (
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
  );
}

/** Site-wide default OG card (Hub / generic shares). */
export function renderSiteOgCard(input: {
  name: string;
  role: string;
  pillars: string;
}): ReactElement {
  return (
    <div style={shellStyle}>
      <OrbitMark />
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
          {input.name}
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#22d3ee",
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          {input.role}
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#94a3b8",
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          {input.pillars}
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
  );
}

/** Per-Write OG card — title + category; future posts get this automatically. */
export function renderWriteOgCard(input: {
  title: string;
  category: string;
  name: string;
}): ReactElement {
  const titleSize = input.title.length > 70 ? 44 : input.title.length > 48 ? 52 : 60;

  return (
    <div style={shellStyle}>
      <OrbitMark />
      <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1, justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#22d3ee",
          }}
        >
          {input.category}
        </div>
        <div
          style={{
            fontSize: titleSize,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.12,
            color: "#ffffff",
            maxWidth: 1040,
          }}
        >
          {input.title}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 22,
          color: "#94a3b8",
        }}
      >
        <span>{input.name}</span>
        <span style={{ letterSpacing: "0.08em", color: "#64748b" }}>Orbit Write</span>
      </div>
    </div>
  );
}
