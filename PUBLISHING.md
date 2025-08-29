# Steam MCP 发布指南

## 发布到 npm

### 1. 准备工作

1. **注册 npm 账号**
   ```bash
   npm adduser
   ```

2. **登录 npm**
   ```bash
   npm login
   ```

3. **检查包名是否可用**
   ```bash
   npm search steam-mcp
   ```

### 2. 发布步骤

1. **构建项目**
   ```bash
   npm run build
   ```

2. **发布到 npm**
   ```bash
   npm publish
   ```

3. **验证发布**
   ```bash
   npm view steam-mcp
   ```

### 3. 更新版本

```bash
# 补丁版本 (1.0.0 -> 1.0.1)
npm version patch

# 次要版本 (1.0.0 -> 1.1.0)
npm version minor

# 主要版本 (1.0.0 -> 2.0.0)
npm version major

# 发布新版本
npm publish
```

## 发布到 GitHub

### 1. 创建 GitHub 仓库

1. 在 GitHub 上创建新仓库 `steam-mcp`
2. 克隆仓库到本地

### 2. 推送代码

```bash
git init
git add .
git commit -m "Initial commit: Steam MCP tool"
git branch -M main
git remote add origin https://github.com/yourusername/steam-mcp.git
git push -u origin main
```

### 3. 创建 Release

1. 在 GitHub 仓库页面点击 "Releases"
2. 点击 "Create a new release"
3. 填写版本号和发布说明
4. 上传构建后的文件

## 使用说明

### 安装方式

#### 全局安装
```bash
npm install -g steam-mcp
steam-mcp
```

#### 本地安装
```bash
npm install steam-mcp
npx steam-mcp
```

#### 直接运行
```bash
git clone https://github.com/yourusername/steam-mcp.git
cd steam-mcp
npm install
npm run build
npm start
```

### MCP 客户端配置

在支持 MCP 的 AI 客户端中添加配置：

```json
{
  "mcpServers": {
    "steam": {
      "command": "steam-mcp",
      "cwd": "/path/to/steam-mcp"
    }
  }
}
```

## 维护和更新

### 1. 监控问题
- 关注 GitHub Issues
- 监控 npm 下载量
- 收集用户反馈

### 2. 定期更新
- 更新依赖包
- 修复已知问题
- 添加新功能

### 3. 版本管理
- 遵循语义化版本控制
- 维护更新日志
- 标记重要变更

## 推广和营销

### 1. 文档完善
- 完善 README.md
- 添加使用示例
- 提供 API 文档

### 2. 社区推广
- 在相关论坛分享
- 参与 MCP 社区讨论
- 撰写技术博客

### 3. 收集反馈
- 鼓励用户提交 Issue
- 收集使用场景
- 持续改进工具
