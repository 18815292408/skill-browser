use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SkillInfo {
    pub id: String,
    pub name: String,
    pub description: String,
    pub path: String,
}

#[tauri::command]
pub fn scan_skills() -> Result<Vec<SkillInfo>, String> {
    let home_dir = dirs::home_dir().ok_or("无法获取用户主目录")?;
    let skills_dir = home_dir.join(".claude").join("skills");

    if !skills_dir.exists() {
        return Ok(vec![]);
    }

    let mut skills = Vec::new();

    if let Ok(entries) = fs::read_dir(&skills_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let id = path.file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or("")
                    .to_string();

                let description = read_skill_description(&path);

                skills.push(SkillInfo {
                    id: id.clone(),
                    name: id.clone(),
                    description,
                    path: path.to_string_lossy().to_string(),
                });
            }
        }
    }

    Ok(skills)
}

fn read_skill_description(path: &PathBuf) -> String {
    let possible_files = ["skill.md", "README.md", "description.md"];

    for file in &possible_files {
        let file_path = path.join(file);
        if file_path.exists() {
            if let Ok(content) = fs::read_to_string(&file_path) {
                // 取前 500 字符作为描述
                let desc = content.chars().take(500).collect::<String>();
                return desc.trim().to_string();
            }
        }
    }

    String::new()
}
