import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://ipc24.de",
  integrations: [tailwind({ applyBaseStyles: false }), mdx(), react()],
});
