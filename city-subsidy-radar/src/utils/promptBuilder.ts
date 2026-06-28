import type { UserProfile, MatchResultItem } from '../types';

export function buildPrompt(
  user: UserProfile,
  matchedResults: MatchResultItem[],
  nearMissResults: MatchResultItem[]
): string {
  const matchedSubsidies = matchedResults
    .map(
      (r) =>
        `- ${r.subsidy.name}：${r.matchedAmount}${r.subsidy.amount.unit}`
    )
    .join('\n');

  const nearMissSubsidies = nearMissResults
    .map(
      (r) =>
        `- ${r.subsidy.name}：还差 ${r.missingConditions.join('；')}`
    )
    .join('\n');

  return `你是人才补贴政策解读专家。

用户条件：
- 城市：${user.city || '未指定'}
- 院校：${user.school}（${user.schoolLevel.join('/') || '未识别层次'}）
- 学历：${user.degree}
- 专业：${user.major || '未填写'}
- 年龄：${user.age}岁
- 毕业年份：${user.graduationYear === 'within_2_years' ? '毕业2年内' : user.graduationYear === 'over_2_years' ? '毕业2年以上' : '未填写'}
- 落户状态：${user.householdStatus}
- 就业状态：${user.employmentStatus}

已匹配补贴：
${matchedSubsidies || '无'}

接近满足但未完全匹配的补贴：
${nearMissSubsidies || '无'}

请输出：
1. 个性化解读（200字内）：总结用户能拿多少补贴，哪些最值得优先申请
2. 避坑提示（3-5条）：常见申领误区和注意事项
3. 反向匹配建议（2-3条）：针对接近满足的补贴，给出如何补齐条件的建议

请以 JSON 格式输出：
{
  "interpretation": "...",
  "pitfallTips": ["...", "..."],
  "reverseSuggestions": [
    {"subsidyName": "...", "suggestion": "..."}
  ]
}`;
}
