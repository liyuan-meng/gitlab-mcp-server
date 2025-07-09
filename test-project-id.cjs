// 项目 ID 功能测试脚本
const { spawn } = require('child_process');

console.log('🚀 测试项目 ID 功能 - GitLab MCP Server v1.1.0\n');

// 测试用例
const testCases = [
  {
    name: '测试项目 ID 参数验证',
    args: ['--project-id', '123'],
    expectedError: '使用项目 ID 时必须提供 gitlab_base_url'
  },
  {
    name: '测试完整项目 ID 参数',
    args: ['--project-id', '123', '--gitlab-base-url', 'https://gitlab.example.com', '--access-token', 'test-token'],
    description: '应该尝试连接到 GitLab API'
  }
];

function runTest(testCase, index) {
  return new Promise((resolve) => {
    console.log(`📋 测试 ${index + 1}: ${testCase.name}`);
    
    const child = spawn('node', ['build/index.js', ...testCase.args], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // 发送一个简单的测试工具调用
    const testRequest = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    }) + '\n';

    child.stdin.write(testRequest);

    setTimeout(() => {
      child.kill();
      
      console.log(`📤 输出 (stderr): ${stderr}`);
      console.log(`📥 输出 (stdout): ${stdout}`);
      
      if (testCase.expectedError) {
        if (stderr.includes(testCase.expectedError)) {
          console.log('✅ 测试通过：正确检测到错误\n');
        } else {
          console.log('❌ 测试失败：未检测到预期错误\n');
        }
      } else {
        if (stderr.includes('GitLab MCP Server v1.1.0 已启动')) {
          console.log('✅ 测试通过：服务器正常启动\n');
        } else {
          console.log('❌ 测试失败：服务器未正常启动\n');
        }
      }
      
      resolve();
    }, 2000);
  });
}

async function runAllTests() {
  for (let i = 0; i < testCases.length; i++) {
    await runTest(testCases[i], i);
  }
  
  console.log('🎉 项目 ID 功能测试完成！');
  console.log('\n📚 使用说明：');
  console.log('1. 通过项目 ID 查询：--project-id 123 --gitlab-base-url "https://gitlab.example.com"');
  console.log('2. 通过完整 URL 查询：--gitlab-url "https://gitlab.example.com/group/project"');
  console.log('3. 两种方式都支持预配置和可选参数');
}

runAllTests().catch(console.error); 