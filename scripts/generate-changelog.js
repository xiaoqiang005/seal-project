const { execSync } = require('child_process');
const fs = require('fs');

// 获取上次文档版本标签
const lastTag = execSync('git describe --tags --abbrev=0 docs-v*').toString().trim();

// 获取自上次标签以来的文档变更
const changes = execSync(`git log ${lastTag}..HEAD -- docs/`).toString();

// 生成变更日志
const changelog = `# 文档变更日志 (${new Date().toISOString().split('T')[0]})
 
## 自 ${lastTag} 以来的变更
 
${changes}
`;

// 写入变更日志文件
fs.writeFileSync('docs/CHANGELOG.md', changelog); 