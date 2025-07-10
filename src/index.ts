#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import axios from 'axios';
import { marked } from 'marked';

// GitLab API 配置
interface GitLabConfig {
  baseUrl: string;
  accessToken: string;
}

// 项目信息接口
interface ProjectInfo {
  id: number;
  name: string;
  description: string;
  web_url: string;
  path_with_namespace: string;
  default_branch: string;
}

// 文档文件接口
interface DocumentFile {
  name: string;
  path: string;
  content: string;
  web_url: string;
}

class GitLabMCPServer {
  private server: Server;
  private config: GitLabConfig | null = null;
  private defaultGitlabUrl: string | null = null;
  private defaultAccessToken: string | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'gitlab-mcp-server',
        version: '1.0.4',
      }
    );

    // 从命令行参数读取默认配置
    this.parseCommandLineArgs();
    
    this.setupHandlers();
  }

  private parseCommandLineArgs() {
    const args = process.argv.slice(2);
    
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--gitlab-url' && i + 1 < args.length) {
        this.defaultGitlabUrl = args[i + 1];
        console.error(`已设置默认GitLab URL: ${this.defaultGitlabUrl}`);
      } else if (args[i] === '--access-token' && i + 1 < args.length) {
        this.defaultAccessToken = args[i + 1];
        console.error('已设置默认访问令牌');
      }
    }

    // 从环境变量读取（作为备选）
    if (!this.defaultGitlabUrl && process.env.GITLAB_URL) {
      this.defaultGitlabUrl = process.env.GITLAB_URL;
      console.error(`从环境变量读取GitLab URL: ${this.defaultGitlabUrl}`);
    }
    
    if (!this.defaultAccessToken && process.env.GITLAB_ACCESS_TOKEN) {
      this.defaultAccessToken = process.env.GITLAB_ACCESS_TOKEN;
      console.error('从环境变量读取访问令牌');
    }
  }

  private setupHandlers() {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get-id',
            description: '获取 GitLab 项目信息，包括项目 ID、名称、描述等',
            inputSchema: {
              type: 'object',
              properties: {
                gitlab_url: {
                  type: 'string',
                  description: 'GitLab 项目的完整 URL（可选，如果已配置默认值）',
                },
                access_token: {
                  type: 'string',
                  description: 'GitLab 访问令牌（可选，如果已配置默认值）',
                },
              },
              required: this.getRequiredFields(),
            },
          },
          {
            name: 'get-docs',
            description: '获取 GitLab 项目中的 .md 文件并输出格式化结果',
            inputSchema: {
              type: 'object',
              properties: {
                gitlab_url: {
                  type: 'string',
                  description: 'GitLab 项目的完整 URL（可选，如果已配置默认值）',
                },
                access_token: {
                  type: 'string',
                  description: 'GitLab 访问令牌（可选，如果已配置默认值）',
                },
                format: {
                  type: 'string',
                  enum: ['html', 'markdown', 'plain'],
                  description: '输出格式：html、markdown 或 plain',
                  default: 'html',
                },
              },
              required: this.getRequiredFields(),
            },
          },
        ] as Tool[],
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get-id':
            return await this.handleGetId(args);
          case 'get-docs':
            return await this.handleGetDocs(args);
          default:
            throw new Error(`未知的工具: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `错误: ${error instanceof Error ? error.message : '未知错误'}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private getRequiredFields(): string[] {
    const required = [];
    if (!this.defaultGitlabUrl) required.push('gitlab_url');
    if (!this.defaultAccessToken) required.push('access_token');
    return required;
  }

  private getEffectiveConfig(args: any): { gitlab_url: string; access_token: string } {
    const gitlab_url = args.gitlab_url || this.defaultGitlabUrl;
    const access_token = args.access_token || this.defaultAccessToken;

    if (!gitlab_url) {
      throw new Error('GitLab URL 未提供且未配置默认值');
    }
    if (!access_token) {
      throw new Error('访问令牌未提供且未配置默认值');
    }

    return { gitlab_url, access_token };
  }

  private parseGitLabUrl(url: string): { baseUrl: string; projectPath: string } {
    const urlObj = new URL(url);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    const projectPath = urlObj.pathname.replace(/^\//, '').replace(/\/$/, '');
    return { baseUrl, projectPath };
  }

  private async handleGetId(args: any) {
    const { gitlab_url, access_token } = this.getEffectiveConfig(args);
    
    const { baseUrl, projectPath } = this.parseGitLabUrl(gitlab_url);
    this.config = { baseUrl, accessToken: access_token };

    try {
      const response = await axios.get(
        `${baseUrl}/api/v4/projects/${encodeURIComponent(projectPath)}`,
        {
          headers: {
            'PRIVATE-TOKEN': access_token,
          },
        }
      );

      const project: ProjectInfo = response.data;
      
      const result = {
        id: project.id,
        name: project.name,
        description: project.description || '无描述',
        web_url: project.web_url,
        path_with_namespace: project.path_with_namespace,
        default_branch: project.default_branch,
      };

      return {
        content: [
          {
            type: 'text',
            text: `## 项目信息

**项目 ID:** ${result.id}
**项目名称:** ${result.name}
**项目描述:** ${result.description}
**项目路径:** ${result.path_with_namespace}
**默认分支:** ${result.default_branch}
**项目 URL:** ${result.web_url}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`获取项目信息失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  private async handleGetDocs(args: any) {
    const { gitlab_url, access_token, format = 'html' } = { ...this.getEffectiveConfig(args), format: args.format || 'html' };
    
    const { baseUrl, projectPath } = this.parseGitLabUrl(gitlab_url);
    this.config = { baseUrl, accessToken: access_token };

    try {
      // 首先获取项目信息
      const projectResponse = await axios.get(
        `${baseUrl}/api/v4/projects/${encodeURIComponent(projectPath)}`,
        {
          headers: {
            'PRIVATE-TOKEN': access_token,
          },
        }
      );

      const project: ProjectInfo = projectResponse.data;
      
      // 尝试多种方式获取文件列表
      let mdFiles = [];
      
      // 方法1：使用搜索 API 查找 .md 文件
      try {
        const searchResponse = await axios.get(
          `${baseUrl}/api/v4/projects/${project.id}/search`,
          {
            headers: {
              'PRIVATE-TOKEN': access_token,
            },
            params: {
              scope: 'blobs',
              search: '.md',
              ref: project.default_branch,
            },
          }
        );
        
        const searchResults = searchResponse.data;
        console.error('调试信息 - 搜索结果完整结构:', JSON.stringify(searchResults, null, 2));
        
        // 从搜索结果中筛选 .md 文件
        mdFiles = searchResults.filter((file: any) => {
          const fileName = (file.filename || file.basename || '').toLowerCase();
          return fileName.endsWith('.md') || fileName.endsWith('.markdown');
        }).map((file: any) => ({
          name: file.filename || file.basename,
          path: file.path || file.filename,
          type: 'blob'
        }));
        
        // 如果搜索API成功但没有找到.md文件，抛出错误以进入fallback方案
        if (mdFiles.length === 0) {
          throw new Error('搜索API未找到.md文件，使用文件树API作为备选方案');
        }
        
      } catch (searchError) {
        console.error('搜索API失败或未找到文件，尝试文件树API:', searchError);
        
        // 方法2：使用文件树 API（递归）
        const filesResponse = await axios.get(
          `${baseUrl}/api/v4/projects/${project.id}/repository/tree`,
          {
            headers: {
              'PRIVATE-TOKEN': access_token,
            },
            params: {
              recursive: true,
              ref: project.default_branch,
              per_page: 100,
            },
          }
        );

        const files = filesResponse.data;
        
        // 调试信息：显示所有文件
        console.error('调试信息 - 文件树所有文件:', files.map((f: any) => ({ name: f.name, path: f.path, type: f.type })));
        
        // 改进文件过滤逻辑，支持更多格式和大小写
        mdFiles = files.filter((file: any) => {
          if (file.type !== 'blob') return false;
          const fileName = file.name.toLowerCase();
          const filePath = file.path.toLowerCase();
          return fileName.endsWith('.md') || fileName.endsWith('.markdown') || 
                 filePath.endsWith('.md') || filePath.endsWith('.markdown');
        });
      }

      console.error('调试信息 - 找到的 MD 文件:', mdFiles.map((f: any) => ({ name: f.name, path: f.path })));

      if (mdFiles.length === 0) {
        // 提供更详细的调试信息
        return {
          content: [
            {
              type: 'text',
              text: `该项目中没有找到 .md 文件\n\n调试信息：\n- 项目ID: ${project.id}\n- 默认分支: ${project.default_branch}\n- 找到的 MD 文件数: ${mdFiles.length}\n\n如果确实有 .md 文件，请检查：\n1. 文件是否在默认分支 (${project.default_branch}) 中\n2. 文件扩展名是否正确\n3. 访问权限是否足够\n4. 检查控制台输出的调试信息`,
            },
          ],
        };
      }

      // 获取每个 .md 文件的内容
      const documentFiles: DocumentFile[] = [];
      
      for (const file of mdFiles) {
        try {
          const fileResponse = await axios.get(
            `${baseUrl}/api/v4/projects/${project.id}/repository/files/${encodeURIComponent(file.path)}`,
            {
              headers: {
                'PRIVATE-TOKEN': access_token,
              },
              params: {
                ref: project.default_branch,
              },
            }
          );

          const content = Buffer.from(fileResponse.data.content, 'base64').toString('utf-8');
          
          documentFiles.push({
            name: file.name,
            path: file.path,
            content,
            web_url: `${project.web_url}/-/blob/${project.default_branch}/${file.path}`,
          });
        } catch (error) {
          console.error(`无法获取文件 ${file.path}:`, error);
        }
      }

      // 格式化输出
      let result = `# ${project.name} - 文档\n\n`;
      result += `**项目描述:** ${project.description || '无描述'}\n`;
      result += `**项目 URL:** ${project.web_url}\n\n`;
      result += `共找到 ${documentFiles.length} 个 Markdown 文件:\n\n`;

      for (const doc of documentFiles) {
        result += `## ${doc.name}\n\n`;
        result += `**文件路径:** ${doc.path}\n`;
        result += `**文件 URL:** ${doc.web_url}\n\n`;
        
        if (format === 'html') {
          result += `**内容:**\n${marked(doc.content)}\n\n`;
        } else if (format === 'markdown') {
          result += `**内容:**\n\`\`\`markdown\n${doc.content}\n\`\`\`\n\n`;
        } else {
          result += `**内容:**\n${doc.content}\n\n`;
        }
        
        result += '---\n\n';
      }

      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    } catch (error) {
      throw new Error(`获取文档失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('GitLab MCP Server v1.0.4-configurable 已启动');
    if (this.defaultGitlabUrl) {
      console.error(`默认GitLab URL: ${this.defaultGitlabUrl}`);
    }
    if (this.defaultAccessToken) {
      console.error('默认访问令牌: 已配置');
    }
  }
}

// 启动服务器
const server = new GitLabMCPServer();
server.run().catch(console.error); 