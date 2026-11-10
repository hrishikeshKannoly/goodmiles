import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "goodmiles — Car Care", short_name: "goodmiles", description: "Your car care, right where you park.", start_url: "/app", scope: "/", display: "standalone", background_color: "#071824", theme_color: "#071824", icons: [{src:"/icons/app-192.png",sizes:"192x192",type:"image/png"},{src:"/icons/app-512.png",sizes:"512x512",type:"image/png"}] };
}
