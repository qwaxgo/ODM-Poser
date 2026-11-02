// @ts-check
// The site. The pages are made here (src/pages: the site root with the link card, the editor, the
// docs); web/ goes out as it is (publicDir): the editor's scripts, styles and pictures.
import { createReadStream, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import { defineConfig } from "astro/config";

const base = "/ODM-Poser";

const MODS = resolve("mods");
const TYPES = { ".js": "text/javascript", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml" };

// npm run dev only: the server root (what VS Code's port forwarding opens) goes to the base, a page
// asked for without its last "/" gets it (as GitHub Pages does; the editor's links are relative),
// and <base>/mods/ is the mods/ folder, where the editor (../mods/ in web/mods.js) looks for your mods.
const devServer = {
	name: "odm-poser-dev-server",
	apply: /** @type {const} */ ("serve"),
	/** @param {import("vite").ViteDevServer} server */
	configureServer(server) {
		// a post hook, so that this goes in front of Astro's own middleware (also put first in a
		// post hook), which answers outside the base with 404 and strips the base from req.url
		return () => {
			server.middlewares.stack.unshift({
				route: "",
				/** @type {import("vite").Connect.NextHandleFunction} */
				handle: (req, res, next) => {
					const [path, query = ""] = (req.url || "/").split(/\?(.*)/s);
					if (path.startsWith(`${base}/mods/`)) {
						const file = resolve(MODS, "." + decodeURIComponent(path.slice(`${base}/mods`.length)));
						let ok = false;
						try { ok = file.startsWith(MODS + sep) && statSync(file).isFile(); } catch {}
						if (!ok) return next();
						res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream", "Cache-Control": "no-cache" });
						createReadStream(file).pipe(res);
						return;
					}
					let to = null;
					if (path === "/") to = `${base}/`;
					else if (path.startsWith(`${base}/`) && !path.endsWith("/") && !extname(path)) to = `${path}/`;
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
	markdown: {
		// code as plain text in the page's own colours (ui.src.css), light or dark
		syntaxHighlight: false,
	},
	vite: {
		plugins: [devServer],
	},
});
