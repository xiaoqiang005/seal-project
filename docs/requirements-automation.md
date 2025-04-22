# 需求文档自动化方案

## 当前已实现的自动化机制

### 1. 前端文档自动化
- **JSDoc 配置已实现**：
  - 前端项目已配置 `jsdoc.json`，支持自动生成 API 和组件文档
  - 配置了 TypeScript 和 Vue.js 的文档生成插件
  - 文档输出目录设置为 `./docs`

### 2. 后端文档自动化
- **Sphinx 配置已实现**：
  - 后端项目已配置 `docs/conf.py`，支持自动生成 Python 代码文档
  - 启用了 `autodoc`、`viewcode` 和 `napoleon` 扩展
  - 支持中文文档生成

### 3. CI/CD 流程
- **GitHub Actions 已配置**：
  - 已设置基本的 CI 流程，包括测试和构建
  - 支持代码覆盖率报告上传到 Codecov

## 待实现的自动化机制

### 1. Git Hooks 自动扫描变更

#### 实现方案
1. **创建 pre-commit 钩子**：
   ```bash
   # 在项目根目录创建 .git/hooks/pre-commit 文件
   #!/bin/bash
   
   # 获取变更的文件
   CHANGED_FILES=$(git diff --cached --name-only)
   
   # 检查是否有需求相关的文件变更
   if echo "$CHANGED_FILES" | grep -q "src/views/"; then
     echo "检测到视图组件变更，更新需求文档..."
     # 调用文档更新脚本
     node scripts/update-requirements.js
     # 将更新后的文档添加到暂存区
     git add docs/requirements.md
   fi
   ```

2. **创建文档更新脚本**：
   ```javascript
   // scripts/update-requirements.js
   const fs = require('fs');
   const path = require('path');
   
   // 读取视图组件目录
   const viewsDir = path.join(__dirname, '../frontend/src/views');
   const views = fs.readdirSync(viewsDir);
   
   // 读取现有需求文档
   const requirementsPath = path.join(__dirname, '../docs/requirements.md');
   let requirements = fs.readFileSync(requirementsPath, 'utf8');
   
   // 分析视图组件，更新功能模块部分
   // ...实现文档更新逻辑
   
   // 写回更新后的文档
   fs.writeFileSync(requirementsPath, requirements);
   ```

### 2. 接口文档自动生成与集成

#### 实现方案
1. **前端 API 文档自动生成**：
   - 在 `package.json` 中添加文档生成脚本：
     ```json
     "scripts": {
       "docs": "jsdoc -c jsdoc.json"
     }
     ```
   - 在 CI 流程中添加文档生成步骤：
     ```yaml
     - name: Generate frontend documentation
       run: |
         cd frontend
         npm run docs
     ```

2. **后端 API 文档自动生成**：
   - 安装 `drf-yasg` 包：
     ```bash
     pip install drf-yasg
     ```
   - 在 Django 项目中配置 Swagger：
     ```python
     # config/urls.py
     from drf_yasg.views import get_schema_view
     from drf_yasg import openapi
     
     schema_view = get_schema_view(
        openapi.Info(
           title="API Documentation",
           default_version='v1',
           description="API documentation",
        ),
        public=True,
     )
     
     urlpatterns = [
        # ...其他 URL 配置
        path('swagger/', schema_view.with_ui('swagger', cache_timeout=0)),
     ]
     ```

3. **文档集成到需求文档**：
   - 创建文档集成脚本：
     ```javascript
     // scripts/integrate-docs.js
     const fs = require('fs');
     const path = require('path');
     
     // 读取 API 文档
     const apiDocs = fs.readFileSync(path.join(__dirname, '../frontend/docs/api.html'), 'utf8');
     
     // 读取需求文档
     const requirementsPath = path.join(__dirname, '../docs/requirements.md');
     let requirements = fs.readFileSync(requirementsPath, 'utf8');
     
     // 提取 API 文档中的接口信息
     // ...实现文档提取逻辑
     
     // 更新需求文档中的接口设计部分
     // ...实现文档更新逻辑
     
     // 写回更新后的文档
     fs.writeFileSync(requirementsPath, requirements);
     ```

### 3. 文档版本控制机制

#### 实现方案
1. **使用 Git 标签管理文档版本**：
   - 创建文档版本标签脚本：
     ```bash
     # scripts/tag-docs.sh
     #!/bin/bash
     
     # 获取当前版本
     VERSION=$(node -p "require('./package.json').version")
     
     # 创建文档版本标签
     git tag -a "docs-v$VERSION" -m "Documentation version $VERSION"
     
     # 推送标签到远程仓库
     git push origin "docs-v$VERSION"
     ```

2. **文档变更日志自动生成**：
   - 创建变更日志生成脚本：
     ```javascript
     // scripts/generate-changelog.js
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
     ```

### 4. 定期文档审查和更新机制

#### 实现方案
1. **设置 GitHub Actions 定时任务**：
   - 在 `.github/workflows/` 目录下创建 `docs-review.yml`：
     ```yaml
     name: Documentation Review
     
     on:
       schedule:
         - cron: '0 0 * * 0'  # 每周日运行
     
     jobs:
       review:
         runs-on: ubuntu-latest
         steps:
           - uses: actions/checkout@v4
           
           - name: Set up Node.js
             uses: actions/setup-node@v4
             with:
               node-version: '20'
               
           - name: Install dependencies
             run: |
               npm install -g markdownlint-cli
               
           - name: Lint documentation
             run: |
               markdownlint docs/*.md
               
           - name: Check for outdated documentation
             run: |
               node scripts/check-outdated-docs.js
               
           - name: Create issue if outdated
             if: failure()
             uses: actions/github-script@v7
             with:
               script: |
                 github.rest.issues.create({
                   owner: context.repo.owner,
                   repo: context.repo.repo,
                   title: '文档需要更新',
                   body: '检测到文档与代码不同步，请及时更新。'
                 })
     ```

2. **创建文档过期检查脚本**：
   ```javascript
   // scripts/check-outdated-docs.js
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
   ```

## 实施步骤

1. **第一阶段：基础自动化**
   - 完善 JSDoc 和 Sphinx 配置
   - 在 CI 流程中添加文档生成步骤
   - 创建基本的文档更新脚本

2. **第二阶段：Git Hooks 集成**
   - 实现 pre-commit 钩子
   - 开发文档更新脚本
   - 测试文档自动更新功能

3. **第三阶段：文档版本控制**
   - 实现文档版本标签脚本
   - 创建变更日志生成脚本
   - 集成到 CI 流程

4. **第四阶段：定期审查机制**
   - 设置 GitHub Actions 定时任务
   - 实现文档过期检查脚本
   - 配置自动创建问题功能

## 注意事项

1. **文档格式一致性**：确保自动生成的文档与手动编写的文档格式一致
2. **敏感信息处理**：避免在文档中暴露敏感信息
3. **文档质量检查**：添加文档质量检查步骤，确保自动生成的文档符合质量标准
4. **备份机制**：在自动更新文档前创建备份，以防更新失败导致文档丢失
5. **团队协作**：确保团队成员了解文档自动化机制，避免手动修改自动生成的文档 