// @ts-check
// The site. web/ goes out as it is (publicDir): the editor stays plain files that also open from
// disk and from tools/serve.py, with no build. Astro makes only the pages around it (src/pages:
// the site root with the link card).
import { defineConfig } from "astro/config";

export default defineConfig({
	site: "https://apps.qwaxgo.com",
	base: "/ODM-Poser",
	publicDir: "./web",
	outDir: "./dist",
	server: {
		host: true,
	},
});
