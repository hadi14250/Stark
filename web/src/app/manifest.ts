import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "STARK",
    short_name: "STARK",
    description:
      "A Saudi manufacturer of integrated woodworks, mattresses and turnkey hospitality environments.",
    start_url: "/",
    display: "standalone",
    background_color: "#1c3c2d",
    theme_color: "#1c3c2d",
    icons: [
      {
        src: "/brand/logo-icon-green.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
