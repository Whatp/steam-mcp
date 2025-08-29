import { SteamService } from './services/steamService.js';

async function testSteamService() {
  console.log('=== 测试 Steam 服务 ===\n');
  
  const steamService = new SteamService();

  try {
    // 测试搜索游戏
    console.log('1. 测试搜索游戏...');
    const games = await steamService.searchGames('Cyberpunk 2077');
    console.log(`找到 ${games.length} 个游戏:`);
    games.slice(0, 3).forEach((game, index) => {
      console.log(`  ${index + 1}. ${game.name} (App ID: ${game.appId})`);
    });

    if (games.length > 0) {
      const testAppId = games[0].appId;
      
      console.log('\n2. 测试获取游戏详情...');
      const gameDetails = await steamService.getGameDetails(testAppId);
      if (gameDetails) {
        console.log('游戏详情:');
        console.log(`  名称: ${gameDetails.name || 'N/A'}`);
        console.log(`  描述: ${gameDetails.description || 'N/A'}`);
        console.log(`  价格: ${gameDetails.price || 'N/A'}`);
        console.log(`  标签: ${gameDetails.tags?.join(', ') || 'N/A'}`);
        console.log(`  发布日期: ${gameDetails.releaseDate || 'N/A'}`);
      } else {
        console.log('无法获取游戏详情');
      }

      console.log('\n3. 测试获取游戏评论...');
      const reviews = await steamService.getGameReviews({
        appId: testAppId,
        language: 'schinese',
        numPerPage: 3
      });

      if (reviews.success) {
        console.log(`成功获取 ${reviews.reviews.length} 条评论:`);
        reviews.reviews.forEach((review, index) => {
          console.log(`\n  评论 ${index + 1}:`);
          console.log(`    作者: ${review.author}`);
          console.log(`    评分: ${review.rating}`);
          console.log(`    评论: ${review.review.substring(0, 100)}...`);
          console.log(`    有用: ${review.helpfulCount}, 无用: ${review.unhelpfulCount}`);
          console.log(`    游戏时间: ${review.playtime} 小时`);
          console.log(`    日期: ${review.date}`);
        });
      } else {
        console.log('获取评论失败:', reviews.error);
      }
    }

  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }

  console.log('\n=== 测试完成 ===');
}

// 运行测试
testSteamService().catch(console.error);
