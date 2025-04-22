const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 获取最近修改的代码文件
const recentCodeChanges = execSync('git log --since="1 week ago" --name-only --pretty=format:').toString().split('\n');

// 获取需求文档最后修改时间
const requirementsPath = path.join(__dirname, '../docs/requirements.md');
const requirementsStats = fs.statSync(requirementsPath);
const requirementsMtime = requirementsStats.mtime;

// 检查是否有代码变更但文档未更新
const codeChangedButDocsNotUpdated = recentCodeChanges.some(file => {
  // 忽略非源代码文件
  if (!file.match(/\.(js|ts|vue|py)$/)) return false;
  
  // 获取文件最后修改时间
  const fileStats = fs.statSync(path.join(__dirname, '..', file));
  return fileStats.mtime > requirementsMtime;
});

if (codeChangedButDocsNotUpdated) {
  console.error('检测到代码变更但文档未更新');
  process.exit(1);
} 