// The docs: which pages there are, in which order, and the words around them in each language.
import { getCollection, type CollectionEntry } from "astro:content";

export type Lang = "ja" | "en";
export const LANGS: Lang[] = ["ja", "en"];

// the site's root, with its last "/" (BASE_URL may come without it)
export const ROOT = import.meta.env.BASE_URL.replace(/\/?$/, "/");

// the pages in the order of the menu; the title is the page's own first heading
export const PAGES: { slug: string; about: Record<Lang, string> }[] = [
	{ slug: "download", about: { ja: "サーバーなしで使う：HTML 版、Windows・Linux のアプリ版。署名のないアプリの警告。", en: "Use it without a server: the HTML build, the Windows and Linux apps, the unsigned-app warning." } },
	{ slug: "app", about: { ja: "ブラウザから「アプリ」として追加する。オフラインで開く、スマホ・タブレットに入れる。", en: "Install it from the browser as an app: offline, on phones and tablets." } },
	{ slug: "export", about: { ja: "アタリ画像・OpenPose 画像・構図の画像・ポーズのファイルを書き出す。大きさと書き出す人物。", en: "Export the rough, OpenPose and composition pictures and the pose file: sizes, which figures." } },
	{ slug: "poses", about: { ja: "プリセットとユーザープリセット（自分のポーズ集）。ファイルの形。", en: "Presets and user presets (your own pose sets): the file." } },
	{ slug: "props", about: { ja: "小物を持たせる・身に着ける・単体で置く、物体を置く。3軸の大きさ。", en: "Props held, worn or placed on their own, objects on the floor: sizes on three axes." } },
	{ slug: "modding", about: { ja: "MOD で小物・物体・オーラ・手の形・ポーズ・欄を足す。MOD API の説明。", en: "Add props, objects, auras, hand shapes, poses and panels with a mod: the MOD API." } },
	{ slug: "comfyui", about: { ja: "ComfyUI のノードとして使う（ODM-Poser-ComfyUIBridge）。出力とつなぎ方。", en: "Use it as a ComfyUI node (ODM-Poser-ComfyUIBridge): its outputs." } },
];

export const WORDS = {
	ja: { docs: "ドキュメント", editor: "エディタを開く", other: "English", menu: "ドキュメントのページ", repo: "GitHub リポジトリ", lead: "立体人形装置（ODM Poser）の使い方と、MOD の作り方です。" },
	en: { docs: "Docs", editor: "Open the editor", other: "日本語", menu: "Docs pages", repo: "GitHub repository", lead: "How to use ODM Poser (立体人形装置) and how to write mods." },
} satisfies Record<Lang, Record<string, string>>;

// NAME.md -> {slug: "name", lang: "en"}, NAME-JA.md -> {slug: "name", lang: "ja"}
export function placeOf(id: string): { slug: string; lang: Lang } {
	const m = id.match(/^([A-Z]+)(-JA)?\.md$/);
	if (!m) throw new Error(`docs/${id}: not NAME.md or NAME-JA.md`);
	return { slug: m[1].toLowerCase(), lang: m[2] ? "ja" : "en" };
}

export function href(lang: Lang, slug?: string): string {
	return `${ROOT}docs/${lang}/${slug ? slug + "/" : ""}`;
}

export function editorHref(lang: Lang): string {
	return `${ROOT}editor/${lang === "en" ? "?lang=en" : ""}`;
}

// the pages of one language, in the menu's order, with their titles
export async function pagesOf(lang: Lang): Promise<{ slug: string; title: string; about: string; entry: CollectionEntry<"docs"> }[]> {
	const entries = await getCollection("docs");
	return PAGES.flatMap(({ slug, about }) => {
		const entry = entries.find(e => { const p = placeOf(e.id); return p.slug === slug && p.lang === lang; });
		return entry ? [{ slug, title: titleOf(entry), about: about[lang], entry }] : [];
	});
}

export function titleOf(entry: CollectionEntry<"docs">): string {
	const m = (entry.body || "").match(/^#\s+(.+)$/m);
	return m ? m[1].trim() : entry.id;
}
