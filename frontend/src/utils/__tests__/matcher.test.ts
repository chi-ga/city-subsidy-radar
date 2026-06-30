import { describe, it, expect } from 'vitest';
import { calculateTotalAmount, groupExclusiveItems, getExclusiveGroupName, matchSubsidy } from '../matcher';
import type { SubsidyAmount, MatchResultItem, Subsidy, UserProfile } from '../../types';

describe('calculateTotalAmount', () => {
  it('一次性补贴：max 即为总额', () => {
    const amount: SubsidyAmount = { min: 10000, max: 10000, unit: '元', period: '一次性' };
    const result = calculateTotalAmount(amount);
    expect(result.total).toBe(10000);
    expect(result.breakdown).toContain('一次性');
  });

  it('每月补贴：max × durationMonths', () => {
    const amount: SubsidyAmount = {
      min: 2000,
      max: 2000,
      unit: '元',
      period: '每月',
      durationMonths: 36,
    };
    const result = calculateTotalAmount(amount);
    expect(result.total).toBe(72000);
    expect(result.breakdown).toContain('36');
  });

  it('每月补贴：durationMonths 缺失时默认 12 个月', () => {
    const amount: SubsidyAmount = { min: 1500, max: 1500, unit: '元', period: '每月' };
    const result = calculateTotalAmount(amount);
    expect(result.total).toBe(18000);
  });

  it('万元单位正确换算', () => {
    const amount: SubsidyAmount = { min: 1, max: 5, unit: '万元', period: '一次性' };
    const result = calculateTotalAmount(amount);
    expect(result.total).toBe(50000);
  });

  it('按学历分档：命中硕士档位', () => {
    const baseAmount: SubsidyAmount = { min: 500, max: 500, unit: '元', period: '每月' };
    const masterAmount: SubsidyAmount = {
      min: 1000,
      max: 1000,
      unit: '元',
      period: '每月',
      durationMonths: 36,
    };
    const result = calculateTotalAmount(baseAmount, '硕士', { 硕士: masterAmount });
    expect(result.total).toBe(36000);
  });

  it('按学历分档：未命中档位时回退到基础金额', () => {
    const baseAmount: SubsidyAmount = { min: 500, max: 500, unit: '元', period: '每月' };
    const masterAmount: SubsidyAmount = {
      min: 1000,
      max: 1000,
      unit: '元',
      period: '每月',
      durationMonths: 36,
    };
    const result = calculateTotalAmount(baseAmount, '本科', { 硕士: masterAmount });
    expect(result.total).toBe(6000); // 500 × 12
  });

  it('每季度补贴：max × 4', () => {
    const amount: SubsidyAmount = {
      min: 3000,
      max: 3000,
      unit: '元',
      period: '每季度',
    };
    const result = calculateTotalAmount(amount);
    expect(result.total).toBe(12000);
  });

  it('max 为 0 时总额为 0', () => {
    const amount: SubsidyAmount = { min: 0, max: 0, unit: '元', period: '一次性' };
    const result = calculateTotalAmount(amount);
    expect(result.total).toBe(0);
  });
});

describe('matchSubsidy criterionSets amount', () => {
  const baseSubsidy: Subsidy = {
    id: 'test-criterion-amount',
    name: '测试按集合金额',
    city: 'chengdu',
    category: 'living',
    conditions: {
      degree: ['本科', '硕士', '博士'],
      ageLimit: 35,
      employmentRequired: true,
      criterionSets: [
        {
          id: 'benke-shuoshi',
          name: '本科/硕士研究生',
          degree: ['本科', '硕士'],
        },
        {
          id: 'boshi-premium',
          name: '博士研究生（高层次）',
          degree: ['博士'],
          amount: { min: 100000, max: 100000, unit: '元', period: '一次性' },
        },
      ],
    },
    amount: { min: 10000, max: 100000, unit: '元', period: '一次性' },
    tieredAmount: {
      本科: { min: 10000, max: 10000, unit: '元', period: '一次性' },
      硕士: { min: 20000, max: 20000, unit: '元', period: '一次性' },
      博士: { min: 30000, max: 30000, unit: '元', period: '一次性' },
    },
    application: { deadline: '', channel: '', materials: [], location: '市级' },
    policySource: '',
    effectiveDate: '',
    notes: '',
  };

  it('本科/硕士使用 tieredAmount 金额', () => {
    const user: UserProfile = {
      city: 'chengdu',
      degree: '硕士',
      school: '北京大学',
      schoolLevel: ['双一流'],
      major: '计算机科学与技术',
      householdStatus: '未落户',
      employmentStatus: '已就业',
      age: 30,
    };
    const result = matchSubsidy(user, baseSubsidy);
    expect(result.matched).toBe(true);
    expect(result.matchedAmount).toBe(20000);
  });

  it('博士使用 criterionSet 指定金额', () => {
    const user: UserProfile = {
      city: 'chengdu',
      degree: '博士',
      school: '北京大学',
      schoolLevel: ['双一流'],
      major: '计算机科学与技术',
      householdStatus: '未落户',
      employmentStatus: '已就业',
      age: 30,
    };
    const result = matchSubsidy(user, baseSubsidy);
    expect(result.matched).toBe(true);
    expect(result.matchedAmount).toBe(100000);
  });
});

describe('getExclusiveGroupName', () => {
  it('返回互斥组名称', () => {
    const name = getExclusiveGroupName('beijing_zhongguancun_talent');
    expect(name).toBeTruthy();
  });

  it('无匹配互斥组时返回回退名称', () => {
    const name = getExclusiveGroupName('non_existent_policy');
    expect(name).toContain('互斥组');
    expect(name).toContain('non_existent_policy');
  });
});

describe('groupExclusiveItems', () => {
  it('空数组返回空分组', () => {
    const { groups, standalone } = groupExclusiveItems([]);
    expect(groups).toHaveLength(0);
    expect(standalone).toHaveLength(0);
  });

  it('无互斥组的项归入 standalone', () => {
    const items: MatchResultItem[] = [
      {
        subsidy: {
          id: 'test1',
          name: '测试补贴1',
          city: 'beijing',
          category: 'rent',
          conditions: {},
          amount: { min: 1000, max: 1000, unit: '元', period: '每月' },
          application: { deadline: '', channel: '', materials: [], location: '' },
          policySource: '',
          effectiveDate: '',
          notes: '',
        },
        matched: true,
        matchedAmount: 12000,
        amountBreakdown: '1000元/月×12',
        missingConditions: [],
      },
    ];
    const { groups, standalone } = groupExclusiveItems(items);
    expect(standalone).toHaveLength(1);
    expect(groups).toHaveLength(0);
  });
});
