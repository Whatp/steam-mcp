import { SteamService } from '../services/steamService.js';

async function example() {
  const steamService = new SteamService();

  console.log('=== Steam评论获取示例 ===\n');

  // 示例1: 搜索游戏
  console.log('1. 搜索游戏 "Cyberpunk 2077":');
  try {
    const games = await steamService.searchGames('Cyberpunk 2077');
    console.log(`找到 ${games.length} 个游戏:`);
    games.forEach((game, index) => {
      console.log(`  ${index + 1}. ${game.name} (App ID: ${game.appId})`);
    });
  } catch (error) {
    console.error('搜索失败:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 示例2: 获取游戏评论 (使用Cyberpunk 2077的App ID: 1091500)
  console.log('2. 获取游戏评论 (Cyberpunk 2077):');
  try {
    const reviews = await steamService.getGameReviews({
      appId: '1091500',
      language: 'schinese',
      reviewType: 'all',
      numPerPage: 5
    });

    if (reviews.success) {
      console.log(`成功获取 ${reviews.reviews.length} 条评论 (总计: ${reviews.totalCount}):`);
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
      console.error('获取评论失败:', reviews.error);
    }
  } catch (error) {
    console.error('获取评论失败:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 示例3: 获取游戏详情
  console.log('3. 获取游戏详情:');
  try {
    const gameDetails = await steamService.getGameDetails('1091500');
    if (gameDetails) {
      console.log('游戏详情:');
      console.log(`  名称: ${gameDetails.name}`);
      console.log(`  描述: ${gameDetails.description}`);
      console.log(`  价格: ${gameDetails.price}`);
      console.log(`  标签: ${gameDetails.tags?.join(', ')}`);
      console.log(`  发布日期: ${gameDetails.releaseDate}`);
    } else {
      console.log('无法获取游戏详情');
    }
  } catch (error) {
    console.error('获取游戏详情失败:', error);
  }
}

// 如果直接运行此文件，则执行示例
if (import.meta.url === `file://${process.argv[1]}`) {
  example().catch(console.error);
}
