// ODM Poser as an app: a window around the editor. Three things are the app's own:
//  - the mods: the editor finds the mods/ folder next to the app through the odmmods:// protocol
//    (mods.rs lists them, the list is put in the page before its scripts run);
//  - saving: the editor's "save" gives the bytes to save_file, which asks where to put the file;
//  - links: tauri-plugin-opener opens a link to another site in the browser (the guide, GitHub).
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod mods;

use tauri::http::{header, Response, StatusCode};
use tauri::ipc::{InvokeBody, Request};
use tauri::{WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_dialog::DialogExt;

const SCHEME: &str = "odmmods";

/// Where a mod's file is asked for: the protocol's address (WebView2 writes it as a host name).
fn mods_base() -> String {
    if cfg!(windows) {
        format!("http://{SCHEME}.localhost/")
    } else {
        format!("{SCHEME}://localhost/")
    }
}

/// What the page needs before the editor's own scripts: the mods, and the way to save.
fn init_script() -> String {
    format!(
        r#"window.ODM_POSER_MODS = {list};
window.ODM_POSER_MODS_BASE = "{base}";
window.ODM_APP_SAVE = async (blob, name) => {{
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return window.__TAURI_INTERNALS__.invoke("save_file", bytes, {{ headers: {{ "x-name": name }} }});
}};"#,
        list = mods::list_js(&mods::dir()),
        base = mods_base(),
    )
}

/// Save what the editor made: ask where, write it. true when saved, false when the person cancelled.
/// The editor sends the bytes as the request's body and the suggested name in the x-name header.
#[tauri::command]
async fn save_file(app: tauri::AppHandle, request: Request<'_>) -> Result<bool, String> {
    let InvokeBody::Raw(bytes) = request.body() else {
        return Err("no data".into());
    };
    let name: String = request
        .headers()
        .get("x-name")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("odm-poser")
        .chars()
        .map(|c| if c.is_ascii_alphanumeric() || matches!(c, '.' | '_' | '-') { c } else { '_' })
        .collect();
    let mut dialog = app.dialog().file().set_file_name(&name);
    if let Some((_, ext)) = name.rsplit_once('.') {
        let label = match ext {
            "png" => "PNG",
            "json" => "JSON",
            _ => "File",
        };
        dialog = dialog.add_filter(label, &[ext]);
    }
    let Some(chosen) = dialog.blocking_save_file() else {
        return Ok(false);
    };
    let path = chosen.into_path().map_err(|e| e.to_string())?;
    std::fs::write(path, bytes).map_err(|e| e.to_string())?;
    Ok(true)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .register_uri_scheme_protocol(SCHEME, |_ctx, request| {
            // odmmods://localhost/<file> (or <folder>/<file>): a mod's script, from the mods folder only
            let rel = request.uri().path().trim_start_matches('/');
            let body = mods::resolve(&mods::dir(), rel).and_then(|f| std::fs::read(f).ok());
            let (status, data) = match body {
                Some(b) => (StatusCode::OK, b),
                None => (StatusCode::NOT_FOUND, Vec::new()),
            };
            Response::builder()
                .status(status)
                .header(header::CONTENT_TYPE, "text/javascript")
                .header(header::CACHE_CONTROL, "no-cache")
                .body(data)
                .unwrap()
        })
        .invoke_handler(tauri::generate_handler![save_file])
        .setup(|app| {
            WebviewWindowBuilder::new(app, "main", WebviewUrl::App("editor/index.html".into()))
                .title("立体人形装置 ODM Poser")
                .inner_size(1280.0, 860.0)
                .min_inner_size(480.0, 480.0)
                .initialization_script(init_script())
                .build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("ODM Poser could not start");
}
