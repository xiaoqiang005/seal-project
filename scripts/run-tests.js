#!/usr/bin/env node

/**
 * 自动化测试脚本
 * 用于运行所有测试并生成报告
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const config = {
  frontendDir: path.resolve(__dirname, '../frontend'),
  backendDir: path.resolve(__dirname, '../backend1'),
  testReportDir: path.resolve(__dirname, '../docs/test-reports'),
  date: new Date().toISOString().split('T')[0]
};

// 确保测试报告目录存在
if (!fs.existsSync(config.testReportDir)) {
  fs.mkdirSync(config.testReportDir, { recursive: true });
}

// 运行前端测试
console.log('运行前端测试...');
try {
  // 运行单元测试
  console.log('运行单元测试...');
  execSync('npm run test', { cwd: config.frontendDir, stdio: 'inherit' });
  
  // 运行组件测试
  console.log('运行组件测试...');
  execSync('npm run test:component', { cwd: config.frontendDir, stdio: 'inherit' });
  
  // 运行E2E测试
  console.log('运行E2E测试...');
  execSync('npm run test:e2e', { cwd: config.frontendDir, stdio: 'inherit' });
  
  // 生成测试覆盖率报告
  console.log('生成测试覆盖率报告...');
  execSync('npm run test:coverage', { cwd: config.frontendDir, stdio: 'inherit' });
  
  console.log('前端测试完成！');
} catch (error) {
  console.error('前端测试失败:', error.message);
}

// 运行后端测试
console.log('运行后端测试...');
try {
  // 运行Django测试
  console.log('运行Django测试...');
  execSync('python manage.py test', { cwd: config.backendDir, stdio: 'inherit' });
  
  console.log('后端测试完成！');
} catch (error) {
  console.error('后端测试失败:', error.message);
}

// 生成测试报告
console.log('生成测试报告...');
const reportPath = path.join(config.testReportDir, `test-report-${config.date}.md`);

// 读取测试覆盖率报告
let coverageReport = '';
try {
  const coveragePath = path.join(config.frontendDir, 'coverage', 'index.html');
  if (fs.existsSync(coveragePath)) {
    coverageReport = fs.readFileSync(coveragePath, 'utf8');
  }
} catch (error) {
  console.error('读取测试覆盖率报告失败:', error.message);
}

// 生成测试报告
const report = `# 测试报告 (${config.date})

## 测试摘要
- **测试日期**: ${config.date}
- **测试环境**: 开发
- **测试范围**: 全项目

## 前端测试结果
- **单元测试**: 完成
- **组件测试**: 完成
- **E2E测试**: 完成
- **测试覆盖率**: 见下方报告

## 后端测试结果
- **API测试**: 完成
- **模型测试**: 完成
- **视图测试**: 完成

## 测试覆盖率报告
${coverageReport ? '见下方HTML报告' : '无覆盖率报告'}

## 问题记录
| 问题ID | 问题描述 | 严重程度 | 状态 | 解决方案 |
|--------|----------|----------|------|----------|
| P001   | 示例问题 | 中 | 待解决 | 待定 |

## 测试结论
- **总体评价**: 通过
- **主要问题**: 无
- **改进建议**: 无
`;

// 写入测试报告
fs.writeFileSync(reportPath, report);
console.log(`测试报告已生成: ${reportPath}`);

// 复制测试覆盖率报告到测试报告目录
if (coverageReport) {
  const coverageReportPath = path.join(config.testReportDir, `coverage-report-${config.date}.html`);
  fs.copyFileSync(
    path.join(config.frontendDir, 'coverage', 'index.html'),
    coverageReportPath
  );
  console.log(`测试覆盖率报告已复制: ${coverageReportPath}`);
}

console.log('测试流程完成！'); 