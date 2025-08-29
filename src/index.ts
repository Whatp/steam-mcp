import { SteamMCP } from './mcp/steamMCP.js';

async function main() {
  try {
    const steamMCP = new SteamMCP();
    await steamMCP.start();
  } catch (error) {
    console.error('启动Steam MCP失败:', error);
    process.exit(1);
  }
}

main();
