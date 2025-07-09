# 使用示例

## 🔧 在 Cursor 中配置

### 1. 配置 MCP 服务端

#### 方式1：预配置默认值（推荐）

在 Cursor 的设置中，添加以下配置并预设默认参数：

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "node",
      "args": [
        "/path/to/your/gitlab-mcp-server/build/index.js",
        "--gitlab-url", "https://gitlab.example.com/group/project",
        "--access-token", "glpat-xxxxxxxxxxxxxxxxxxxx"
      ]
    }
  }
}
```

#### 方式2：环境变量配置

设置环境变量：
```bash
export GITLAB_URL="https://gitlab.example.com/group/project"
export GITLAB_ACCESS_TOKEN="glpat-xxxxxxxxxxxxxxxxxxxx"
```

然后在 Cursor 中配置：
```json
{
  "mcpServers": {
    "gitlab": {
      "command": "node",
      "args": ["/path/to/your/gitlab-mcp-server/build/index.js"]
    }
  }
}
```

#### 方式3：基础配置（每次手动指定参数）

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "node",
      "args": ["/path/to/your/gitlab-mcp-server/build/index.js"]
    }
  }
}
```

### 2. 获取 GitLab 访问令牌

1. 登录你的 GitLab 实例
2. 转到 Settings → Access Tokens
3. 创建新令牌，权限选择：
   - `read_api`
   - `read_repository`

### 3. 在 Cursor 中使用

#### 获取项目信息

**使用预配置（推荐）**：
```
获取项目信息
get-id
```

**手动指定参数**：
```
请使用 gitlab get-id 工具获取以下项目的信息：
- GitLab URL: https://gitlab.example.com/group/project-name
- Access Token: glpat-xxxxxxxxxxxxxxxxxxxx
```

**覆盖默认配置**：
```
get-id --gitlab-url "https://gitlab.example.com/other/project"
```

#### 获取项目文档

**使用预配置（推荐）**：
```
获取项目文档
get-docs
get-docs --format markdown
```

**手动指定参数**：
```
请使用 gitlab get-docs 工具获取以下项目的文档：
- GitLab URL: https://gitlab.example.com/group/project-name
- Access Token: glpat-xxxxxxxxxxxxxxxxxxxx
- Format: html
```

**覆盖默认配置**：
```
get-docs --gitlab-url "https://gitlab.example.com/docs/project" --format html
```

## 🎯 实际使用场景

### 场景 1：团队项目文档分析

当你需要分析团队项目的文档时：

```
分析这个React组件库的文档结构
get-docs --gitlab-url "http://gitlab.**"
```

输出结果：
- 📄 获取到15个Markdown文件
- 🧩 包含各种业务组件的API文档
- 🎨 HTML格式，便于直接查看

### 场景 2：项目信息快速查询

当你需要快速了解项目基本信息时：

```
查看画布组件项目信息
get-id --gitlab-url "http://gitlab.platdep.**"
```

输出结果：
- 📋 项目ID、名称、描述
- 🌿 默认分支信息
- 🔗 项目访问链接

### 场景 3：多格式文档输出

根据不同需求选择不同的输出格式：

```bash
# HTML 格式（默认）- 适合直接查看，包含样式
get-docs --format html

# Markdown 格式 - 适合复制到其他地方
get-docs --format markdown

# Plain 格式 - 适合纯文本处理
get-docs --format plain
```

### 场景 4：批量项目文档处理

处理多个项目的文档：

```bash
# 获取多个项目的文档
get-docs --gitlab-url "http://gitlab.platdep.**.com/project1"
get-docs --gitlab-url "http://gitlab.platdep.**.com/project2"
get-docs --gitlab-url "http://gitlab.platdep.**.com/project3"
```

### 场景 5：自然语言调用

使用自然语言与AI助手交互：

```
帮我查看商品选择器的用法
短信编辑器如何使用
获取这个项目的README文档
分析项目中的API文档
```

## 🚨 故障排除

### 常见问题

1. **MCP 服务端未启动**
   - 确保项目已编译：`npm run build`
   - 检查配置文件中的路径是否正确
   - 重启 Cursor 以加载新配置

2. **GitLab 认证失败**
   - 验证访问令牌是否正确
   - 确保令牌有足够的权限（`read_repository`, `read_api`）
   - 检查令牌是否过期

3. **项目访问被拒绝**
   - 检查项目 URL 是否正确
   - 确保你有访问该项目的权限
   - 验证项目是否存在

4. **没有找到 .md 文件**
   - 确认项目中确实存在 Markdown 文件
   - 检查文件是否在默认分支中
   - 确认文件扩展名是否正确（.md 或 .markdown）

5. **配置缓存问题**
   - 重启 Cursor 编辑器
   - 清除 MCP 缓存
   - 检查配置文件语法

### 调试技巧

1. **查看服务端日志**
   ```bash
   npm start
   # 或者
   node build/index.js --gitlab-url "your-url" --access-token "your-token"
   ```

2. **测试连接**
   ```bash
   node test.js
   node debug-test.js
   ```

3. **验证配置**
   - 确保 mcp.config.json 配置正确
   - 验证项目路径和命令
   - 检查参数格式

4. **启用详细日志**
   ```bash
   DEBUG=* npm start
   ```

## 💡 最佳实践

### 1. 配置管理

**推荐配置顺序**：
1. 优先使用预配置方式（命令行参数）
2. 其次使用环境变量
3. 最后使用手动参数

**配置示例**：
```json
// 推荐：为常用项目配置默认值
{
  "gitlab": {
    "command": "node",
    "args": [
      "/path/to/gitlab-mcp-server/build/index.js",
      "--gitlab-url", "http://gitlab.company.com/main/project",
      "--access-token", "glpat-xxx"
    ]
  }
}
```

### 2. 令牌管理

**安全要求**：
- 定期更新访问令牌（建议每3个月）
- 为不同项目使用不同的令牌
- 不要在代码中硬编码令牌
- 使用最小权限原则

**令牌权限**：
```
必需权限：
- read_api: 读取项目信息
- read_repository: 读取仓库文件

可选权限：
- read_user: 读取用户信息（如果需要）
```

### 3. 性能优化

**文件处理**：
- 大型项目可能包含很多 Markdown 文件
- 系统会自动递归搜索所有 .md 文件
- 建议按需获取特定格式的文档

**网络优化**：
- 使用稳定的网络连接
- 避免频繁调用API
- 考虑使用缓存机制

### 4. 使用技巧

**文档格式选择**：
- **HTML格式**：适合直接查看，包含完整样式
- **Markdown格式**：适合复制到其他文档工具
- **Plain格式**：适合文本处理和分析

**自然语言交互**：
```bash
# 有效的问法
"获取项目文档"
"帮我查看GitLab项目的README"
"分析这个项目的API文档"

# 避免的问法
"执行某个命令"
"运行脚本"
```

### 5. 安全考虑

**访问控制**：
- 确保令牌的权限最小化
- 不要共享访问令牌
- 定期检查令牌使用情况
- 及时撤销不需要的令牌

**数据保护**：
- 避免在日志中输出敏感信息
- 使用HTTPS连接
- 定期审计访问记录

## 📚 相关文档

- [README.md](./README.md) - 项目概述和快速开始
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - 项目架构说明和开发指南 