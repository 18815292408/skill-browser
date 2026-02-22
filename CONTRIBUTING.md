# 贡献指南

感谢您对本项目的感兴趣！欢迎贡献代码。

## 如何贡献

### 报告问题

如果您发现 bug 或有新功能建议，请先搜索是否已存在相关 issue。如果没有，请创建一个新的 issue 并提供：
- 清晰的标题和问题描述
- 复现步骤（如果是 bug）
- 环境信息（操作系统、版本等）

### 提交代码

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/your-username/skill-browser.git
cd skill-browser

# 安装依赖
npm install

# 启动开发模式
npx tauri dev
```

## 代码规范

- 使用 TypeScript 进行开发
- 遵循项目现有的代码风格
- 确保代码通过 TypeScript 类型检查
- 添加必要的注释

## 测试

在提交前请确保：
- `npm run build` 能够成功构建
- `npx tauri build` 能够生成安装包

## 问题解答

如果您有任何问题，可以通过以下方式联系我们：
- 提交 GitHub Issue
- 在 GitHub Discussions 中提问

感谢您的贡献！
