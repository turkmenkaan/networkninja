import { ImageResponse } from "next/og";

export const alt = "NetworkNinja — stop reading about networks, run them";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default social-share card, on-brand (ink canvas + blade accent). Uses the
 * built-in font so no network fetch is needed at build time. Per-page OG images
 * can be added later by dropping opengraph-image files in those route folders.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#0a0c10",
          backgroundImage: "linear-gradient(135deg, #0a0c10 0%, #0e1a1f 100%)",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            color: "#4fe0c4",
            fontSize: 30,
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
          NetworkNinja
        </div>

        <div
          style={{
            marginTop: 28,
            color: "#e8e6df",
            fontSize: 84,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          Stop reading about networks.
        </div>
        <div
          style={{
            color: "#4fe0c4",
            fontSize: 84,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          Run them.
        </div>

        <div
          style={{
            marginTop: 36,
            color: "#9aa3af",
            fontSize: 34,
            maxWidth: 900,
          }}
        >
          Hands-on networking: real FRR routers you boot yourself with
          Containerlab. Master BGP the way operators actually work.
        </div>
      </div>
    ),
    { ...size },
  );
}
