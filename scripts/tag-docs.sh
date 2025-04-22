#!/bin/bash

# 获取当前版本
VERSION=$(node -p "require('./package.json').version")

# 创建文档版本标签
git tag -a "docs-v$VERSION" -m "Documentation version $VERSION"

# 推送标签到远程仓库
git push origin "docs-v$VERSION" 