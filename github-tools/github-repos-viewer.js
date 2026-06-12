#!/usr/bin/env node

/**
 * GitHub 仓库查看器
 * 用法：node github-repos-viewer.js
 */

// 方法1：获取热门仓库
async function getPopularRepos() {
  const response = await fetch(
    'https://api.github.com/search/repositories?q=stars:>10000&sort=stars&order=desc&per_page=30',
    {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        // 如果有 GitHub Token，可以增加：
        // 'Authorization': 'token YOUR_GITHUB_TOKEN'
      }
    }
  );

  const data = await response.json();

  console.log('🔥 GitHub 最热门的 30 个仓库：\n');
  data.items.forEach((repo, index) => {
    console.log(`${index + 1}. ${repo.full_name}`);
    console.log(`   ⭐ ${repo.stargazers_count.toLocaleString()} stars`);
    console.log(`   📝 ${repo.description || '无描述'}`);
    console.log(`   🔗 ${repo.html_url}\n`);
  });
}

// 方法2：按条件搜索仓库
async function searchRepos(query, language = '', minStars = 0) {
  let searchQuery = query;

  if (language) {
    searchQuery += `+language:${language}`;
  }

  if (minStars > 0) {
    searchQuery += `+stars:>${minStars}`;
  }

  const response = await fetch(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&order=desc&per_page=20`,
    {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    }
  );

  const data = await response.json();

  console.log(`\n🔍 搜索结果："${query}"（共 ${data.total_count.toLocaleString()} 个）\n`);
  data.items.forEach((repo, index) => {
    console.log(`${index + 1}. ${repo.full_name} (⭐ ${repo.stargazers_count.toLocaleString()})`);
    console.log(`   ${repo.description || '无描述'}`);
    console.log(`   ${repo.html_url}\n`);
  });
}

// 方法3：获取趋势仓库（最近创建且高 star）
async function getTrendingRepos(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const dateStr = date.toISOString().split('T')[0];

  const response = await fetch(
    `https://api.github.com/search/repositories?q=created:>${dateStr}&sort=stars&order=desc&per_page=20`,
    {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    }
  );

  const data = await response.json();

  console.log(`\n📈 最近 ${days} 天的趋势仓库：\n`);
  data.items.forEach((repo, index) => {
    const created = new Date(repo.created_at).toLocaleDateString('zh-CN');
    console.log(`${index + 1}. ${repo.full_name}`);
    console.log(`   ⭐ ${repo.stargazers_count.toLocaleString()} stars | 📅 创建于 ${created}`);
    console.log(`   📝 ${repo.description || '无描述'}`);
    console.log(`   🔗 ${repo.html_url}\n`);
  });
}

// 方法4：按主题浏览
async function getReposByTopic(topic) {
  const response = await fetch(
    `https://api.github.com/search/repositories?q=topic:${topic}&sort=stars&order=desc&per_page=20`,
    {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    }
  );

  const data = await response.json();

  console.log(`\n🏷️  主题 "${topic}" 的热门仓库（共 ${data.total_count.toLocaleString()} 个）：\n`);
  data.items.forEach((repo, index) => {
    console.log(`${index + 1}. ${repo.full_name} (⭐ ${repo.stargazers_count.toLocaleString()})`);
    console.log(`   ${repo.description || '无描述'}`);
    console.log(`   ${repo.html_url}\n`);
  });
}

// 主菜单
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'popular':
      await getPopularRepos();
      break;

    case 'search':
      const query = args[1] || 'react';
      const language = args[2] || '';
      await searchRepos(query, language);
      break;

    case 'trending':
      const days = parseInt(args[1]) || 7;
      await getTrendingRepos(days);
      break;

    case 'topic':
      const topic = args[1] || 'ai';
      await getReposByTopic(topic);
      break;

    default:
      console.log(`
GitHub 仓库查看器

用法：
  node github-repos-viewer.js popular              # 最热门的仓库
  node github-repos-viewer.js search <关键词>      # 搜索仓库
  node github-repos-viewer.js trending [天数]       # 趋势仓库（默认7天）
  node github-repos-viewer.js topic <主题>          # 按主题查看

示例：
  node github-repos-viewer.js popular
  node github-repos-viewer.js search "react hooks" typescript
  node github-repos-viewer.js trending 30
  node github-repos-viewer.js topic machine-learning
`);
      await getPopularRepos();
  }
}

// 运行
main().catch(console.error);
