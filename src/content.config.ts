// The docs pages (src/pages/docs): the guides in docs/, NAME.md in English and NAME-JA.md in
// Japanese. The plans and HANDOFF.md there are for working on the editor and stay out.
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

export const collections = {
	docs: defineCollection({
		loader: glob({
			base: "./docs",
			pattern: ["APP.md", "APP-JA.md", "MODDING.md", "MODDING-JA.md", "DOWNLOAD.md", "DOWNLOAD-JA.md", "EXPORT.md", "EXPORT-JA.md",
				"POSES.md", "POSES-JA.md", "PROPS.md", "PROPS-JA.md", "COMFYUI.md", "COMFYUI-JA.md"],
			generateId: ({ entry }) => entry,
		}),
	}),
};
