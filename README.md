# Skill 浏览器

Skill 浏览器桌面应用 - 基于 Tauri 2.x + React + TypeScript 开发。

## 功能特性

- 技能翻译管理
- 剪贴板集成
- 文件系统访问
- 桌面托盘功能（开发中）

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS
- **状态管理**: Zustand
- **桌面框架**: Tauri 2.x

## 开发

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npx tauri dev
```

### 构建

```bash
npx tauri build
```

## 项目结构

```
skill-browser/
├── src/                 # 前端源代码
│   ├── App.tsx          # 主应用组件
│   ├── main.tsx         # 入口文件
│   └── index.css        # 全局样式
├── src-tauri/           # Tauri 后端
│   ├── src/
│   │   ├── main.rs      # 主入口
│   │   └── lib.rs       # 库入口
│   ├── Cargo.toml       # Rust 依赖
│   └── tauri.conf.json  # Tauri 配置
├── index.html           # HTML 模板
├── package.json         # Node 依赖
├── vite.config.ts       # Vite 配置
└── tailwind.config.js  # Tailwind 配置
```
