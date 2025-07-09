# GitLab MCP Server 项目架构说明

## 📋 项目概述

这是一个完整的 GitLab MCP (Model Context Protocol) 服务端实现，能够连接私有 GitLab 实例，获取项目信息并读取 Markdown 文档。该项目支持**默认配置**、**可选参数**和**多种配置方式**，大大简化了使用体验。

## 🎯 核心功能

### 1. 项目信息获取 (`get-id`)
- 获取 GitLab 项目的基本信息
- 包括项目 ID、名称、描述、URL、默认分支等
- 支持私有项目访问
- **参数可选**：支持预配置默认值

### 2. 文档读取 (`get-docs`)
- 递归搜索项目中的所有 `.md` 和 `.markdown` 文件
- 支持多种输出格式：HTML、Markdown、Plain Text
- 自动格式化和美化输出
- 提供文件路径和 Web URL
- **批量处理**：一次性获取所有文档文件

### 3. 配置管理
- **默认配置支持**：命令行参数预配置
- **环境变量配置**：支持 `GITLAB_URL` 和 `GITLAB_ACCESS_TOKEN`
- **可选参数**：工具参数变为可选，大大简化使用
- **多种配置方式**：灵活适应不同使用场景

## 🏗️ 项目结构

```
gitlab-mcp-server/
├── src/
│   └── index.ts                 # 主要的 MCP 服务端实现
├── build/                       # 编译后的 JavaScript 文件
├── package.json                 # 项目配置和依赖
├── tsconfig.json               # TypeScript 配置
├── mcp.config.json             # MCP 配置文件
├── example.config.json         # 示例配置文件
├── test.js                     # 测试脚本
├── debug-test.js               # 调试测试脚本
├── README.md                   # 项目说明文档
├── USAGE.md                    # 使用示例文档
├── PROJECT_SUMMARY.md          # 项目概览（本文件）
└── .gitignore                  # Git 忽略文件
```

## 🔧 技术实现

### 核心技术栈
- **TypeScript**: 类型安全的 JavaScript
- **@modelcontextprotocol/sdk**: MCP 协议实现
- **axios**: HTTP 客户端，用于 GitLab API 调用
- **marked**: Markdown 转 HTML 解析器
- **zod**: 输入验证和类型检查

### 主要特性
- ✅ 支持私有 GitLab 实例
- ✅ 基于访问令牌的身份认证
- ✅ 递归文件搜索算法
- ✅ 多格式输出支持（HTML/Markdown/Plain）
- ✅ **默认配置支持**
- ✅ **可选参数**
- ✅ **环境变量配置**
- ✅ **自然语言交互**
- ✅ 错误处理和调试
- ✅ TypeScript 类型安全
- ✅ 完整的测试脚本

### 架构设计

#### 1. 配置层级
```
1. 命令行参数（最高优先级）
2. 环境变量
3. 默认配置
4. 手动参数（最低优先级）
```

#### 2. 核心类设计
```typescript
class GitLabMCPServer {
  private config: GitLabConfig | null = null;
  private defaultGitlabUrl: string | null = null;
  private defaultAccessToken: string | null = null;
  
  // 配置管理
  private parseCommandLineArgs(): void
  private getEffectiveConfig(args: any): any
  
  // 工具实现
  private async handleGetId(args: any): Promise<ProjectInfo>
  private async handleGetDocs(args: any): Promise<DocumentResult>
  
  // API 调用
  private async getProjectInfo(url: string, token: string): Promise<ProjectInfo>
  private async getProjectDocs(url: string, token: string, format: string): Promise<DocumentResult>
}
```

#### 3. API 优化
- 使用 GitLab **Search API** 而非 Tree API
- 支持递归搜索所有分支
- 优化网络请求性能
- 错误恢复机制

#### 4. 数据流程
```
用户输入 → 参数解析 → 配置合并 → GitLab API 调用 → 数据处理 → 格式化输出
```

## 📦 依赖管理

### 运行时依赖
```json
{
  "@modelcontextprotocol/sdk": "^0.4.0",
  "axios": "^1.6.0",
  "marked": "^12.0.0",
  "zod": "^3.22.0"
}
```

### 开发依赖
```json
{
  "@types/node": "^20.0.0",
  "typescript": "^5.0.0"
}
```

## 🔄 版本历史

### v1.0.2-configurable（当前版本）
- ✨ 添加默认配置支持
- ✨ 支持命令行参数配置
- ✨ 支持环境变量配置
- ✨ 工具参数变为可选
- 🐛 修复文件搜索算法
- 📚 完善使用文档

### v1.0.1-debug
- 🐛 修复 GitLab API 搜索问题
- 🔍 添加详细调试信息
- 🚀 改进文件发现算法

### v1.0.0
- 🎉 初始版本发布
- 📋 项目信息获取功能
- 📄 Markdown 文档读取功能
- 🎨 多格式输出支持

## 🛠️ 开发和调试

### 开发环境设置
```bash
# 克隆项目
git clone <repository-url>
cd gitlab-mcp-server

# 安装依赖
npm install

# 开发模式
npm run dev

# 编译项目
npm run build
```

### 测试脚本
```bash
# 基础测试
npm test

# 调试测试
npm run debug

# 手动测试
node build/index.js --gitlab-url "your-url" --access-token "your-token"
```

### 调试技巧
1. 使用 `npm test` 验证基本功能
2. 检查 `npm start` 的日志输出
3. 验证 GitLab API 连接
4. 确认访问令牌权限
5. 启用详细日志：`DEBUG=* npm start`

### 代码结构
- **src/index.ts** - 主要实现文件
- **test.js** - 基础功能测试
- **debug-test.js** - 调试和故障排除
- **build/** - 编译后的 JavaScript 文件

## 📈 性能优化

### 算法优化
- 使用 GitLab Search API 替代 Tree API
- 异步处理多个文件
- 批量 API 调用优化
- 内存使用优化

### 网络优化
- 连接池复用
- 请求去重
- 智能重试机制
- 缓存机制（计划中）

## 🤝 贡献指南

### 开发流程
1. Fork 项目
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交代码更改：`git commit -am 'Add new feature'`
4. 推送到分支：`git push origin feature/new-feature`
5. 创建 Pull Request

### 代码规范
- 使用 TypeScript 进行类型安全
- 遵循 ESLint 规则
- 添加必要的测试
- 更新相关文档

### 测试要求
- 单元测试覆盖率 > 80%
- 集成测试验证
- 手动测试验证
- 性能测试评估

### 代码提交规范
- `feat:` 新功能
- `fix:` 修复问题
- `docs:` 文档更新
- `style:` 代码格式化
- `refactor:` 重构代码
- `test:` 添加测试
- `chore:` 构建过程或辅助工具的变动

## 📚 相关文档

- [README.md](README.md) - 项目概述和快速开始
- [USAGE.md](USAGE.md) - 详细使用指南和最佳实践

---

**最后更新**: 2024年12月  
**版本**: 1.0.2-configurable  
**状态**: 生产就绪 ✅  
**维护者**: 活跃维护中 🔄 