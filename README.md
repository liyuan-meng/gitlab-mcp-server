# GitLab MCP Server

一个用于 GitLab 项目文档读取的 MCP（Model Context Protocol）服务端。该服务端可以连接到私有 GitLab 实例，获取项目信息并读取项目中的 Markdown 文档。

## 🚀 功能特性

- 🔐 **支持私有 GitLab 项目访问**
- 📋 **获取项目基本信息**（ID、名称、描述等）
- 📄 **批量读取 .md 文件**（支持递归搜索）
- 🎨 **多种输出格式**（HTML、Markdown、纯文本）
- ⚙️ **预配置支持**（命令行参数 + 环境变量）
- 🔧 **与 Cursor 编辑器无缝集成**
- 🚫 **可选参数**（支持默认配置，减少重复输入）

## 🚀 快速开始

### 方式一：通过 npm 安装（推荐）

```bash
# 全局安装
npm install -g @liyuan.meng/gitlab-mcp-server

# 或者使用 npx（无需安装）
npx @liyuan.meng/gitlab-mcp-server --help
```

### 方式二：本地开发构建

```bash
# 克隆项目
git clone <repository-url>
cd gitlab-mcp-server

# 安装依赖
npm install

# 编译项目
npm run build
```

### 1. 获取 GitLab 访问令牌

1. 登录你的 GitLab 实例
2. 转到 **Settings** → **Access Tokens**
3. 创建新令牌，权限选择：`read_api` 和 `read_repository`
4. 复制生成的令牌（格式：`glpat-xxxxxxxxxxxxxxxxxxxx`）

### 2. 配置 Cursor

**推荐：使用 npx（npm 安装后）**

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "npx",
      "args": [
        "@liyuan.meng/gitlab-mcp-server",
        "--gitlab-url", "https://gitlab.your-domain.com/group/project",
        "--access-token", "glpat-your-token-here"
      ]
    }
  }
}
```

**或者：本地构建方式**

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "node",
      "args": [
        "/path/to/your/gitlab-mcp-server/build/index.js",
        "--gitlab-url", "https://gitlab.your-domain.com/group/project",
        "--access-token", "glpat-your-token-here"
      ]
    }
  }
}
```

### 3. 开始使用

```bash
# 获取项目信息
get-id

# 获取项目文档
get-docs

# 指定输出格式
get-docs --format markdown

# 覆盖默认配置
get-docs --gitlab-url "https://gitlab.example.com/other/project"
```

## 🎯 基本使用

### 工具说明

| 工具 | 说明 | 参数 |
|------|------|------|
| `get-id` | 获取项目基本信息 | `gitlab_url` (可选), `access_token` (可选) |
| `get-docs` | 获取项目 Markdown 文档 | `gitlab_url` (可选), `access_token` (可选), `format` (可选) |

### 使用示例

```bash
# 自然语言调用
"获取项目文档"
"帮我查看GitLab项目的README"
"查看商品选择器的用法"

# 直接命令调用
get-docs --format html
get-id --gitlab-url "https://gitlab.example.com/other/project"
```

## 📚 文档

- **[详细使用指南](./USAGE.md)** - 完整的使用说明、配置方式、场景示例和最佳实践
- **[项目架构说明](./PROJECT_SUMMARY.md)** - 技术实现、开发指南和贡献说明
- **[发布指南](./PUBLISH.md)** - npm 发布流程和 npx 使用说明

## 📄 许可证

ISC License - 开源且可商用

## 🆘 需要帮助？

- 📚 查看 [USAGE.md](./USAGE.md) 了解详细使用方法
- 📖 查看 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) 了解技术细节
- 🐛 提交 Issue 报告问题
- 💬 参与讨论和改进 