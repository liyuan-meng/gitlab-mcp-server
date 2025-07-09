#!/usr/bin/env node

// 简单的测试脚本，用于验证 GitLab MCP 服务端功能

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, 'build', 'index.js');

console.log('启动 GitLab MCP 服务端测试...');
console.log('服务端路径:', serverPath);

// 创建测试消息
const testMessages = [
  // 列出工具
  {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  },
  // 测试 get-id 工具
  {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'get-id',
      arguments: {
        gitlab_url: 'https://gitlab.example.com/group/project',
        access_token: 'test-token'
      }
    }
  }
];

// 启动服务端进程
const serverProcess = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, NODE_ENV: 'test' }
});

let messageIndex = 0;

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('服务端输出:', output);
  
  // 解析响应
  try {
    const response = JSON.parse(output);
    console.log('解析的响应:', JSON.stringify(response, null, 2));
  } catch (e) {
    console.log('非 JSON 输出:', output);
  }
});

serverProcess.stderr.on('data', (data) => {
  console.log('服务端错误:', data.toString());
});

serverProcess.on('close', (code) => {
  console.log(`服务端进程退出，代码: ${code}`);
});

// 等待一秒后开始发送测试消息
setTimeout(() => {
  console.log('发送测试消息...');
  
  testMessages.forEach((message, index) => {
    setTimeout(() => {
      console.log(`发送消息 ${index + 1}:`, JSON.stringify(message));
      serverProcess.stdin.write(JSON.stringify(message) + '\n');
    }, index * 2000);
  });
  
  // 5秒后关闭
  setTimeout(() => {
    console.log('关闭服务端...');
    serverProcess.kill();
  }, 10000);
}, 1000);

// 处理退出
process.on('SIGINT', () => {
  console.log('收到中断信号，关闭服务端...');
  serverProcess.kill();
  process.exit(0);
}); 