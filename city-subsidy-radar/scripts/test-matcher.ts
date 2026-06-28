/**
 * 随机生成 10 个用户案例，测试深圳问卷条件判断是否正确
 * 运行方式：npx tsx scripts/test-matcher.ts
 */
import { matchAllSubsidies, matchSubsidy } from '../src/utils/matcher';
import { getSubsidiesByCity } from '../src/data';
import type { UserProfile } from '../src/types';
import type { IdentityType, TalentLevel } from '../src/constants';

const subsidies = getSubsidiesByCity('shenzhen');

const identities: (IdentityType | undefined)[] = [
  undefined,
  '港澳居民',
  '台湾居民',
  '外籍人士',
];
const talentLevels: (TalentLevel | undefined)[] = [
  undefined,
  '杰出人才',
  '国家级领军人才',
  '地方级领军人才',
  '后备级人才',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeCase(i: number): UserProfile {
  const degree = pick(['本科', '硕士', '博士'] as const);
  const isOverseas = Math.random() < 0.4;
  const school = isOverseas ? pick(['麻省理工学院', '牛津大学', '香港大学']) : pick(['清华大学', '北京大学', '深圳大学']);
  const schoolLevel = isOverseas
    ? pick([['QS前50'], ['QS前150'], ['THE前200'], ['QS前300']])
    : pick([['985', '双一流'], ['211'], ['双一流'], []]);
  const age = 22 + Math.floor(Math.random() * 25);
  return {
    city: 'shenzhen',
    school,
    schoolLevel,
    degree,
    major: pick(['计算机科学与技术', '金融学', '生物学', '机械工程']),
    age,
    householdStatus: pick(['已落户', '未落户'] as const),
    employmentStatus: pick(['已就业', '未就业'] as const),
    isStemMajor: isOverseas ? pick([true, undefined]) : undefined,
    inTopStudentPlan: Math.random() < 0.3 ? pick(['A', 'B', 'C']) : undefined,
    topStudentPlanBase: undefined,
    majorInShenzhenKeyIndustry: Math.random() < 0.5 ? pick([true, false]) : undefined,
    hasInnovationAbility: Math.random() < 0.2 ? pick(['ability-1', 'ability-2']) : undefined,
    hasInnovationContribution: Math.random() < 0.2 ? pick(['contribution-1']) : undefined,
    talentLevel: pick(talentLevels),
    identityType: pick(identities),
  };
}

console.log('='.repeat(80));
console.log('深圳补贴匹配测试 - 随机 10 个案例');
console.log('='.repeat(80));
console.log(`深圳补贴政策总数：${subsidies.length}\n`);

for (let i = 0; i < 10; i++) {
  const user = makeCase(i);
  const result = matchAllSubsidies(user, subsidies);
  const matched = result.subsidies.filter((s) => s.matched && s.matchedAmount > 0);

  console.log(`\n案例 ${i + 1}:`);
  console.log(
    `  用户: ${user.degree} | ${user.school}(${user.schoolLevel.join('/')}) | ${user.age}岁 | ` +
      `落户:${user.householdStatus} | 就业:${user.employmentStatus} | ` +
      `身份:${user.identityType || '内地居民'} | 人才:${user.talentLevel || '无'}`
  );
  console.log(`  匹配补贴: ${matched.length} 项 | 总金额: ${result.totalAmount.toLocaleString()} 元`);
  matched.forEach((m) => {
    console.log(`    ✓ ${m.subsidy.name} → ${m.matchedAmount.toLocaleString()}元`);
  });
  const nearMiss = result.nearMissItems.slice(0, 3);
  if (nearMiss.length > 0) {
    console.log(`  差一点（可补齐）:`);
    nearMiss.forEach((n) => {
      console.log(`    ✗ ${n.subsidy.name} → 缺: ${n.missingConditions.join('; ')}`);
    });
  }
}

// 专项验证：前海港澳青年政策仅港澳台可匹配
console.log('\n' + '='.repeat(80));
console.log('专项验证：前海港澳青年补贴身份限制');
console.log('='.repeat(80));
const qianhai = subsidies.find((s) => s.id === 'shenzhen-shenzhenshiqianhaishenga');
if (qianhai) {
  const baseUser: UserProfile = {
    city: 'shenzhen',
    school: '香港大学',
    schoolLevel: ['QS前50'],
    degree: '硕士',
    major: '金融学',
    age: 30,
    householdStatus: '未落户',
    employmentStatus: '已就业',
  };
  (['内地居民', '港澳居民', '台湾居民', '外籍人士'] as IdentityType[]).forEach((id) => {
    const r = matchSubsidy({ ...baseUser, identityType: id }, qianhai);
    console.log(`  身份=${id} → 匹配=${r.matched} ${r.matched ? '' : '(缺: ' + r.missingConditions.join(';') + ')'}`);
  });
}

// 专项验证：高层次人才层次匹配
console.log('\n' + '='.repeat(80));
console.log('专项验证：高层次人才层次匹配');
console.log('='.repeat(80));
const talentSubsidies = subsidies.filter((s) => s.conditions.talentLevel);
talentSubsidies.forEach((s) => {
  const lvl = s.conditions.talentLevel![0];
  const r = matchSubsidy(
    {
      city: 'shenzhen',
      school: '北京大学',
      schoolLevel: ['985', '双一流'],
      degree: '博士',
      major: '物理学',
      age: 40,
      householdStatus: '已落户',
      employmentStatus: '已就业',
      talentLevel: lvl as TalentLevel,
    },
    s
  );
  console.log(`  ${lvl} → 匹配=${r.matched} 金额=${r.matchedAmount.toLocaleString()}元`);
});

console.log('\n测试完成。');
