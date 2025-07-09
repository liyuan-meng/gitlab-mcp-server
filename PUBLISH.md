# 发布指南

本文档详细说明如何将 GitLab MCP Server 发布到 npm，并让用户通过 `npx` 使用。

## 📦 发布前准备

### 1. 确保代码质量

```bash
# 编译项目
npm run build

# 运行测试
npm test

# 检查打包内容
npm pack --dry-run
```

### 2. 版本管理

```bash
# 查看当前版本
npm version

# 更新版本号（选择一个）
npm version patch   # 1.0.2 -> 1.0.3
npm version minor   # 1.0.2 -> 1.1.0
npm version major   # 1.0.2 -> 2.0.0
```

### 3. 更新文档

确保以下文档是最新的：
- README.md - 项目概述和快速开始
- USAGE.md - 详细使用指南
- PROJECT_SUMMARY.md - 技术架构说明

## 🚀 发布到 npm

### 1. 登录 npm

```bash
# 首次发布需要登录
npm login

# 验证登录状态
npm whoami
```

### 2. 发布到 npm

```bash
# 发布到 npm
npm publish

# 如果包名已存在，可以发布到 scoped package
npm publish --access public
```

### 3. 验证发布

```bash
# 检查包是否发布成功
npm view @mly/gitlab-mcp-server

# 查看包信息
npm info @mly/gitlab-mcp-server
```

## 🎯 通过 npx 使用

发布成功后，用户可以通过以下方式使用：

### 1. 直接运行

```bash
# 直接运行 MCP 服务器
npx gitlab-mcp-server --gitlab-url "https://gitlab.example.com/group/project" --access-token "glpat-xxx"

# 查看帮助信息
npx gitlab-mcp-server --help
```

### 2. 在 Cursor 中配置

用户可以在 Cursor 的 MCP 配置中直接使用 npx：

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "npx",
      "args": [
        "gitlab-mcp-server",
        "--gitlab-url", "https://gitlab.example.com/group/project",
        "--access-token", "glpat-xxx"
      ]
    }
  }
}
```

### 3. 本地安装

```bash
# 全局安装
npm install -g @mly/gitlab-mcp-server

# 本地安装
npm install @mly/gitlab-mcp-server

# 使用本地安装的版本
npx gitlab-mcp-server
```

## 📋 配置示例

### 基础配置
```json
{
  "mcpServers": {
    "gitlab": {
      "command": "npx",
      "args": ["gitlab-mcp-server"]
    }
  }
}
```

### 预配置项目
```json
{
  "mcpServers": {
    "gitlab": {
      "command": "npx",
      "args": [
        "gitlab-mcp-server",
        "--gitlab-url", "https://gitlab.your-domain.com/group/project",
        "--access-token", "glpat-your-token-here"
      ]
    }
  }
}
```

### 环境变量配置
```bash
# 设置环境变量
export GITLAB_URL="https://gitlab.example.com/group/project"
export GITLAB_ACCESS_TOKEN="glpat-xxx"

# Cursor 配置
{
  "mcpServers": {
    "gitlab": {
      "command": "npx",
      "args": ["gitlab-mcp-server"]
    }
  }
}
```

## 🔄 版本更新流程

### 1. 开发新功能

```bash
# 创建功能分支
git checkout -b feature/new-feature

# 开发和测试
npm run dev
npm test

# 提交代码
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

### 2. 发布新版本

```bash
# 合并到主分支
git checkout main
git merge feature/new-feature

# 更新版本号
npm version patch

# 构建和发布
npm run build
npm publish

# 推送标签
git push --tags
```

## 🛡️ 安全考虑

### 1. npm 访问控制

```bash
# 设置包为公开（如果是私有包）
npm publish --access public

# 查看包权限
npm access list packages

# 添加维护者
npm owner add <username> @mly/gitlab-mcp-server
```

### 2. 版本管理

```bash
# 查看所有版本
npm view @mly/gitlab-mcp-server versions --json

# 废弃某个版本
npm deprecate @mly/gitlab-mcp-server@1.0.0 "This version has security issues"

# 删除版本（24小时内）
npm unpublish @mly/gitlab-mcp-server@1.0.0
```

## 📊 发布检查清单

发布前请确认：

- [ ] 代码编译无错误 (`npm run build`)
- [ ] 测试通过 (`npm test`)
- [ ] 版本号已更新
- [ ] README.md 包含最新的使用说明
- [ ] package.json 中的依赖版本正确
- [ ] .npmignore 文件配置正确
- [ ] 登录到正确的 npm 账户
- [ ] 网络连接正常

## 🚨 常见问题

### 1. 发布失败

```bash
# 检查网络连接
npm ping

# 检查登录状态
npm whoami

# 清除缓存
npm cache clean --force
```

### 2. 包名冲突

```bash
# 检查包名是否可用
npm view @mly/gitlab-mcp-server

# 如果冲突，考虑使用 scoped package
npm init --scope=@your-username
```

### 3. 权限问题

```bash
# 检查包权限
npm access list packages

# 更新权限
npm access grant read-write @your-team:developers @mly/gitlab-mcp-server
```

## 📚 相关资源

- [npm 发布指南](https://docs.npmjs.com/cli/v8/commands/npm-publish)
- [npx 使用指南](https://docs.npmjs.com/cli/v8/commands/npx)
- [package.json 配置](https://docs.npmjs.com/cli/v8/configuring-npm/package-json)
- [语义化版本](https://semver.org/lang/zh-CN/)

---

**注意**: 首次发布需要 npm 账户，请访问 [npmjs.com](https://www.npmjs.com/) 注册账户。 