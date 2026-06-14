import { ImageResponse } from "next/og";

/**
 * Shared 1200x630 Open Graph card, on-brand (ink canvas + blade accent). Used by
 * the per-page opengraph-image routes (units, paths). The home page keeps its
 * own bespoke card. Uses the built-in font, so no network fetch at build time.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export function renderOgImage({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  const sub =
    subtitle && subtitle.length > 140
      ? `${subtitle.slice(0, 137).trimEnd()}…`
      : subtitle;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0c10",
          backgroundImage: "linear-gradient(135deg, #0a0c10 0%, #0e1a1f 100%)",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* brand + section eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              color: "#4fe0c4",
              fontSize: 28,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                backgroundColor: "#4fe0c4",
              }}
            />
            NetworkNinjas
          </div>
          <div
            style={{
              display: "flex",
              color: "#0a0c10",
              backgroundColor: "#4fe0c4",
              fontSize: 24,
              fontWeight: 700,
              padding: "8px 20px",
              borderRadius: 999,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {eyebrow}
          </div>
        </div>

        {/* title + subtitle (vertically centered by space-between) */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              color: "#e8e6df",
              fontSize: 60,
              fontWeight: 800,
              lineHeight: 1.07,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
          {sub ? (
            <div
              style={{
                display: "flex",
                color: "#9aa3af",
                fontSize: 30,
                marginTop: 26,
                lineHeight: 1.3,
                maxWidth: 1000,
              }}
            >
              {sub}
            </div>
          ) : null}
        </div>

        <div
          style={{ display: "flex", color: "#5d6675", fontSize: 24, letterSpacing: "0.04em" }}
        >
          networkninjas.app
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
