import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Buffy Airport Taxi",
    short_name: "Buffy Taxi",
    description:
      "Buffalo airport transfer booking with live route pricing and flexible checkout options.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1219",
    theme_color: "#b87333",
    icons: [
      {
        src: "/globe.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
