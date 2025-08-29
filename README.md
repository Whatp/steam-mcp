# Steam MCP 工具

这是一个基于 Model Context Protocol (MCP) 的 Steam 评论获取工具，可以获取 Steam 游戏的用户评论、搜索游戏和获取游戏详情。

## 功能特性

-  **游戏搜索**: 根据关键词搜索 Steam 游戏
-  **评论获取**: 获取指定游戏的用户评论，支持多种筛选条件
-  **游戏详情**: 获取游戏的基本信息、价格、标签等
-  **多语言支持**: 支持中文、英文、日文、韩文等多种语言
-  **MCP 集成**: 完全兼容 MCP 协议，可与支持 MCP 的 AI 模型集成

## 安装

1. 克隆项目并安装依赖：

```bash
git clone <repository-url>
cd steamMCP
npm install
```

2. 构建项目：

```bash
npm run build
```

## 使用方法

### 作为 MCP 服务器运行

```bash
npm start
```

### 直接使用示例

```bash
npm run dev src/examples/example.ts
```

### 在 MCP 客户端中使用

配置你的 MCP 客户端，添加以下配置：

```json
{
  "mcpServers": {
    "steam": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/steamMCP"
    }
  }
}
```

## 可用工具

### 1. get_steam_reviews

获取 Steam 游戏的用户评论。

**参数:**
- `appId` (必需): Steam 游戏的 App ID
- `language` (可选): 评论语言，默认 `schinese`
- `filter` (可选): 评论筛选，可选值: `all`, `recent`, `updated`
- `reviewType` (可选): 评论类型，可选值: `all`, `positive`, `negative`
- `purchaseType` (可选): 购买类型，可选值: `all`, `non_steam_purchase`, `steam`
- `numPerPage` (可选): 每页评论数量，默认 10，最大 50
- `offset` (可选): 评论偏移量，默认 0

**示例:**
```json
{
  "name": "get_steam_reviews",
  "arguments": {
    "appId": "1091500",
    "language": "schinese",
    "reviewType": "positive",
    "numPerPage": 20
  }
}
```

### 2. search_steam_games

搜索 Steam 游戏。

**参数:**
- `query` (必需): 搜索关键词

**示例:**
```json
{
  "name": "search_steam_games",
  "arguments": {
    "query": "Cyberpunk 2077"
  }
}
```

### 3. get_steam_game_details

获取 Steam 游戏详细信息。

**参数:**
- `appId` (必需): Steam 游戏的 App ID

**示例:**
```json
{
  "name": "get_steam_game_details",
  "arguments": {
    "appId": "1091500"
  }
}
```

## 项目结构

```
steamMCP/
├── src/
│   ├── types/           # TypeScript 类型定义
│   ├── services/        # Steam 服务类
│   ├── mcp/            # MCP 服务器实现
│   ├── examples/       # 使用示例
│   └── index.ts        # 主入口文件
├── package.json
├── tsconfig.json
└── README.md
```

## 技术栈

- **TypeScript**: 主要开发语言
- **MCP SDK**: Model Context Protocol 官方 SDK
- **Axios**: HTTP 请求库
- **Cheerio**: HTML 解析库
- **Node.js**: 运行环境

## 注意事项

1. **速率限制**: 请合理控制请求频率，避免对 Steam 服务器造成过大压力
2. **用户代理**: 工具使用标准的浏览器 User-Agent，但建议遵守 Steam 的使用条款
3. **错误处理**: 所有网络请求都包含错误处理，确保工具的稳定性
4. **语言支持**: 默认支持中文，可根据需要调整语言设置

## 开发

### 开发模式运行

```bash
npm run dev
```

### 运行测试

```bash
npm test
```

### 构建项目

```bash
npm run build
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.0.0
- 初始版本发布
- 支持游戏评论获取
- 支持游戏搜索
- 支持游戏详情获取
- 完整的 MCP 协议支持
