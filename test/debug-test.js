#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, 'build', 'index.js');

console.log('启动调试测试...');

// 实际的测试消息
const testMessage = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: 'get-docs',
    arguments: {
      gitlab_url: 'https://gitlab.example.com/group/project',
      access_token: 'test-token',
      format: 'html'
    }
  }
};

// 启动服务端进程
const serverProcess = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, NODE_ENV: 'debug' }
});

serverProcess.stdout.on('data', (data) => {
  console.log('服务端输出:', data.toString());
});

serverProcess.stderr.on('data', (data) => {
  console.log('服务端调试信息:', data.toString());
});

serverProcess.on('close', (code) => {
  console.log(`服务端进程退出，代码: ${code}`);
});

// 等待服务端启动后发送测试消息
setTimeout(() => {
  console.log('发送测试消息...');
  serverProcess.stdin.write(JSON.stringify(testMessage) + '\n');
  
  // 5秒后关闭
  setTimeout(() => {
    console.log('关闭服务端...');
    serverProcess.kill();
  }, 5000);
}, 1000);

// 处理退出
process.on('SIGINT', () => {
  console.log('收到中断信号，关闭服务端...');
  serverProcess.kill();
  process.exit(0);
}); 