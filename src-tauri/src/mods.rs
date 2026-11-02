//! The user's mods: the files in the mods/ folder next to the app (or the AppImage), listed the way
//! tools/make_mods_list.py does (*.js and <folder>/*.js, a name starting with `_` or `.` skipped).
//! The editor loads them through the odmmods:// protocol (main.rs), which serves only those files.

use std::fs;
use std::path::{Path, PathBuf};

/// The mods folder: ODM_POSER_MODS_DIR, else `mods` next to the AppImage ($APPIMAGE: inside an
/// AppImage the executable is in a temporary mount), else next to the executable.
pub fn dir() -> PathBuf {
    if let Some(d) = std::env::var_os("ODM_POSER_MODS_DIR") {
        return PathBuf::from(d);
    }
    let here = std::env::var_os("APPIMAGE")
        .map(PathBuf::from)
        .or_else(|| std::env::current_exe().ok())
        .and_then(|p| p.parent().map(Path::to_path_buf))
        .unwrap_or_default();
    here.join("mods")
}

/// A file or folder name a mod may have: starts with a letter, digit or `-`; then letters, digits, `_`, `.`, `-`.
fn plain(name: &str) -> bool {
    let mut c = name.chars();
    c.next().is_some_and(|f| f.is_ascii_alphanumeric() || f == '-')
        && c.all(|ch| ch.is_ascii_alphanumeric() || matches!(ch, '_' | '.' | '-'))
}

fn is_js(name: &str) -> bool {
    plain(name) && name.len() > 3 && name.ends_with(".js")
}

fn names(dir: &Path) -> Vec<(String, bool)> {
    // (name, is a folder)
    let Ok(rd) = fs::read_dir(dir) else { return Vec::new() };
    rd.flatten()
        .filter_map(|e| Some((e.file_name().into_string().ok()?, e.path().is_dir())))
        .collect()
}

/// The mods to load: "a.js", "folder/b.js", sorted by path.
pub fn list(dir: &Path) -> Vec<String> {
    let mut out = Vec::new();
    for (name, folder) in names(dir) {
        if folder {
            if plain(&name) {
                for (inner, inner_folder) in names(&dir.join(&name)) {
                    if !inner_folder && is_js(&inner) {
                        out.push(format!("{name}/{inner}"));
                    }
                }
            }
        } else if is_js(&name) {
            out.push(name);
        }
    }
    out.sort();
    out
}

/// The file a request names (`a.js` or `folder/b.js` in the mods folder), or None for anything else
/// (other depth, other name, `..`, a link leading out of the folder).
pub fn resolve(dir: &Path, rel: &str) -> Option<PathBuf> {
    let parts: Vec<&str> = rel.split('/').collect();
    let ok = match parts.as_slice() {
        [file] => is_js(file),
        [folder, file] => plain(folder) && is_js(file),
        _ => false,
    };
    if !ok {
        return None;
    }
    let root = dir.canonicalize().ok()?;
    let file = root.join(rel).canonicalize().ok()?;
    (file.starts_with(&root) && file.is_file()).then_some(file)
}

/// The list as a JavaScript array literal (names are plain, so no escaping is needed).
pub fn list_js(dir: &Path) -> String {
    let items: Vec<String> = list(dir).iter().map(|n| format!("\"{n}\"")).collect();
    format!("[{}]", items.join(","))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn scratch(tag: &str) -> PathBuf {
        let d = std::env::temp_dir().join(format!("odm-poser-mods-{}-{tag}", std::process::id()));
        let _ = fs::remove_dir_all(&d);
        fs::create_dir_all(&d).unwrap();
        d
    }

    fn touch(p: &Path) {
        fs::create_dir_all(p.parent().unwrap()).unwrap();
        fs::write(p, "x").unwrap();
    }

    #[test]
    fn lists_files_and_one_folder_level() {
        let d = scratch("list");
        for f in ["b.js", "a.js", "notes.txt", "_off.js", ".hidden.js", "ODM-Poser-X/m.js", "ODM-Poser-X/deep/n.js", "_old/o.js", "x/readme.md"] {
            touch(&d.join(f));
        }
        assert_eq!(list(&d), ["ODM-Poser-X/m.js", "a.js", "b.js"]);
        assert_eq!(list_js(&d), "[\"ODM-Poser-X/m.js\",\"a.js\",\"b.js\"]");
        assert!(list(&d.join("nope")).is_empty());
    }

    #[test]
    fn serves_only_listed_kinds_of_file() {
        let d = scratch("resolve");
        for f in ["a.js", "ODM-Poser-X/m.js", "ODM-Poser-X/deep/n.js", "_off.js", "t.txt"] {
            touch(&d.join(f));
        }
        assert!(resolve(&d, "a.js").is_some());
        assert!(resolve(&d, "ODM-Poser-X/m.js").is_some());
        for bad in ["", "..", "../a.js", "ODM-Poser-X/../a.js", "ODM-Poser-X/deep/n.js", "_off.js", "t.txt", "a.js/", "/a.js", "a\\b.js", "missing.js", ".js"] {
            assert!(resolve(&d, bad).is_none(), "{bad}");
        }
    }

    #[cfg(unix)]
    #[test]
    fn a_link_out_of_the_folder_is_refused() {
        let d = scratch("link");
        let outside = scratch("outside");
        touch(&outside.join("secret.js"));
        touch(&d.join("ok.js"));
        std::os::unix::fs::symlink(outside.join("secret.js"), d.join("leak.js")).unwrap();
        assert!(resolve(&d, "ok.js").is_some());
        assert!(resolve(&d, "leak.js").is_none());
    }
}
