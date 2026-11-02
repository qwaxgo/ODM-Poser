// @ts-check
// The site. web/ goes out as it is (publicDir): the editor stays plain files that also open from
// disk and from tools/serve.py, with no build. Astro makes only the pages around it (src/pages:
// the site root with the link card).
import { existsSync } from "node:fs";
import { defineConfig } from "astro/config";

const base = "/ODM-Poser";

// npm run dev only: the server root (what VS Code's port forwarding opens) goes to the base, and a
// folder under web/ to its index.html, as GitHub Pages does.
const devRedirects = {
	name: "odm-poser-dev-redirects",
	apply: /** @type {const} */ ("serve"),
	/** @param {import("vite").ViteDevServer} server */
	configureServer(server) {
		// a post hook, so that this goes in front of Astro's own middleware (also put first in a
		// post hook), which answers "/" with 404 and strips the base from req.url
		return () => {
			server.middlewares.stack.unshift({
				route: "",
				/** @type {import("vite").Connect.NextHandleFunction} */
				handle: (req, res, next) => {
					const [path, query = ""] = (req.url || "/").split(/\?(.*)/s);
					let to = null;
					if (path === "/") to = `${base}/`;
					else if (path.startsWith(`${base}/`) && path.endsWith("/") && existsSync(`./web${path.slice(base.length)}index.html`)) to = `${path}index.html`;
					if (!to) return next();
					res.writeHead(302, { Location: query ? `${to}?${query}` : to });
					res.end();
				},
			});
		};
	},
};

export default defineConfig({
	site: "https://apps.qwaxgo.com",
	base,
	publicDir: "./web",
	outDir: "./dist",
	server: {
		host: true,
	},
	vite: {
		plugins: [devRedirects],
	},
});
