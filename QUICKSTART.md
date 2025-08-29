# Steam MCP 快速开始指南

## 🚀 5分钟快速上手

### 1. 安装工具

```bash
# 方式1: 从 npm 安装（推荐）
npm install -g steam-mcp

# 方式2: 从源码安装
git clone https://github.com/yourusername/steam-mcp.git
cd steam-mCP
npm install
npm run build
```

### 2. 启动 MCP 服务器

```bash
# 如果全局安装
steam-mcp

# 如果本地安装
npm start
```

### 3. 在 AI 客户端中使用

#### Claude Desktop 配置
在 Claude Desktop 的配置文件中添加：

```json
{
  "mcpServers": {
    "steam": {
      "command": "steam-mcp"
    }
  }
}
```

#### 其他支持 MCP 的客户端
根据客户端的配置要求，添加相应的 MCP 服务器配置。

### 4. 开始使用

现在您可以在 AI 对话中使用以下工具：

- **搜索游戏**: "帮我搜索赛博朋克2077"
- **获取评论**: "获取赛博朋克2077的中文评论"
- **游戏详情**: "告诉我赛博朋克2077的详细信息"

## 🔧 常见问题

### Q: 工具无法启动？
A: 确保已安装 Node.js 18+ 版本，并正确构建了项目。

### Q: 网络请求失败？
A: 检查网络连接，可能需要配置代理或等待网络恢复。

### Q: 如何自定义配置？
A: 复制 `env.example` 为 `.env` 文件，根据需要修改配置。

## 📚 更多资源

- [完整文档](README.md)
- [发布指南](PUBLISHING.md)
- [问题反馈](https://github.com/yourusername/steam-mcp/issues)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件
