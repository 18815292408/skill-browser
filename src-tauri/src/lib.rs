// Tauri 库入口文件
mod skills;

pub fn run() {
    // 初始化日志
    env_logger::init();

    log::info!("Skill浏览器启动中...");

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
    skills::scan_skills,
    skills::load_cache,
    skills::save_cache
])
        .run(tauri::generate_context!())
        .expect("启动 Skill浏览器 时发生错误");
}
