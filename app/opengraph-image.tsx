import { ImageResponse } from "next/og";

export const alt = "Buffy Airport Taxi booking preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background:
            "linear-gradient(135deg, #09121b 0%, #10273b 48%, #6e3a20 100%)",
          color: "#f8f1e7",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#d9ad6b",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid rgba(217, 173, 107, 0.5)",
            }}
          >
            B
          </div>
          <div style={{ display: "flex" }}>Buffy Airport Taxi</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 74,
              fontWeight: 700,
              lineHeight: 1.05,
            }}
          >
            <div style={{ display: "flex" }}>Buffalo airport rides</div>
            <div style={{ display: "flex" }}>with local, premium feel</div>
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 900,
              fontSize: 30,
              lineHeight: 1.4,
              color: "rgba(248, 241, 231, 0.82)",
            }}
          >
            Live fare estimates, Niagara Falls transfers, and card or cash
            booking in one clean flow.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "rgba(248, 241, 231, 0.88)",
          }}
        >
          <div>BUF airport transfers</div>
          <div>www.buffytaxi.com</div>
        </div>
      </div>
    ),
    size,
  );
}
