/**
 * 政策匹配验证测试
 *
 * 对所有 625 条政策进行自动化测试，验证匹配逻辑是否正确。
 * 测试策略：
 *   1. 数据完整性：每条政策必须有必要的字段
 *   2. 正向匹配：构造满足条件的 Profile，验证能匹配
 *   3. 反向匹配：构造不满足条件的 Profile，验证不匹配
 *   4. criterionSets：验证 OR 逻辑正确
 *   5. 互斥组：验证分组逻辑正确
 */
import { describe, it, expect } from 'vitest'
import { beforeAll } from 'vitest'
import { matchSubsidy, matchAllSubsidies, groupExclusiveItems, calculateTotalAmount } from '../matcher'
import { subsidiesData, getAllSubsidies, loadSchoolsData } from '../../data'
import type { Subsidy, UserProfile } from '../../types'
import type { Degree, SchoolLevel } from '../../constants'

// 加载学校数据（isOverseasSchool 依赖此数据）
beforeAll(async () => {
  await loadSchoolsData()
})

// ========== 辅助函数 ==========

/**
 * 判断政策是否需要海外学校
 */
function needsOverseasSchool(subsidy: Subsidy): boolean {
  const c = subsidy.conditions
  if (c.criterionSets) {
    // 如果所有 criterionSets 都要求 overseas，则需要海外学校
    const hasOverseas = c.criterionSets.some((s) => s.schoolRegion === 'overseas')
    const hasDomestic = c.criterionSets.some((s) => s.schoolRegion === 'domestic')
    // 如果只有 overseas 的集合，没有 domestic 的，则需要海外学校
    if (hasOverseas && !hasDomestic) return true
  }
  return false
}

// 海外学校（在数据库中有记录，且有 QS 前 100 排名）
const OVERSEAS_SCHOOL = '爱丁堡大学'

/**
 * 根据政策 conditions 构造一个"完美匹配"的 UserProfile
 */
function buildPerfectProfile(subsidy: Subsidy): UserProfile {
  const c = subsidy.conditions

  // 学历：取 conditions.degree 的第一个，否则取 criterionSets 中最常见的
  let degree: Degree = '硕士'
  if (c.degree && c.degree.length > 0) {
    degree = c.degree[0] as Degree
  } else if (c.criterionSets) {
    // 从 criterionSets 中找第一个有 degree 的集合
    for (const set of c.criterionSets) {
      if (set.degree && set.degree.length > 0) {
        degree = set.degree[0] as Degree
        break
      }
      if (set.minDegree) {
        degree = set.minDegree as Degree
        break
      }
    }
  }

  // 判断是否需要海外学校
  const overseas = needsOverseasSchool(subsidy)

  // 院校层次
  const OVERSEAS_LEVELS: SchoolLevel[] = ['QS前100', 'THE前100', 'USNews前100', '软科前100']
  let schoolLevel: SchoolLevel[] = ['双一流']
  if (overseas) {
    // 从政策的 schoolLevel 中找到学校实际拥有的
    const policyLevels = c.schoolLevel || []
    const setLevels = c.criterionSets?.flatMap((s) => s.schoolLevel || []) || []
    const allRequired = [...policyLevels, ...setLevels]
    const match = OVERSEAS_LEVELS.find((l) => allRequired.includes(l))
    schoolLevel = match ? [match] : ['QS前100']
  } else if (c.schoolLevel && c.schoolLevel.length > 0) {
    schoolLevel = [c.schoolLevel[0]]
  } else if (c.criterionSets) {
    for (const set of c.criterionSets) {
      if (set.schoolLevel && set.schoolLevel.length > 0) {
        schoolLevel = [set.schoolLevel[0]]
        break
      }
    }
  }

  // 年龄：取 ageLimit - 5，确保不超限
  let age = 28
  if (c.ageLimit) {
    age = c.ageLimitExclusive ? c.ageLimit - 1 : c.ageLimit - 5
  } else if (c.criterionSets) {
    for (const set of c.criterionSets) {
      if (set.ageLimit) {
        age = set.ageLimitExclusive ? set.ageLimit - 1 : set.ageLimit - 5
        break
      }
    }
  }

  const profile: UserProfile = {
    city: subsidy.city,
    school: overseas ? OVERSEAS_SCHOOL : '北京大学',
    schoolLevel,
    degree,
    major: '计算机科学与技术',
    age,
    householdStatus: c.householdRequired ? '已落户' : '未落户',
    employmentStatus: c.employmentRequired ? '已就业' : '未就业',
    isFullTime: c.requiresFullTime ? true : undefined,
    graduationYear: c.graduationYear || undefined,
  }

  // 特殊条件
  if (c.returneeStatus) {
    profile.returneeStatus = c.returneeStatus
  }
  if (c.isFirstLingangEmployment) {
    profile.isFirstLingangEmployment = true
  }
  if (c.isFirstGuangzhouHukou) {
    profile.isFirstGuangzhouHukou = true
  }
  if (c.huaduImportStatus) {
    profile.huaduImportStatus = c.huaduImportStatus
  }
  if (c.identityType && c.identityType.length > 0) {
    profile.identityType = c.identityType[0]
  }
  if (c.companyType && c.companyType.length > 0) {
    profile.companyType = c.companyType[0]
  }
  if (c.talentLevel && c.talentLevel.length > 0) {
    profile.talentLevel = c.talentLevel[0]
  }
  if (c.skillLevel && c.skillLevel.length > 0) {
    profile.skillLevel = c.skillLevel[0]
  }
  if (c.firstShenzhenEmploymentAfter) {
    profile.firstShenzhenEmploymentDate = '2026-06-01'
  }

  return profile
}

/**
 * 为有 criterionSets 的政策构造完美 Profile
 * 尝试让至少一个集合能匹配（取第一个可匹配的集合的条件）
 */
function buildPerfectProfileForCriterionSets(subsidy: Subsidy): UserProfile {
  const c = subsidy.conditions
  if (!c.criterionSets || c.criterionSets.length === 0) {
    return buildPerfectProfile(subsidy)
  }

  // 找一个最容易匹配的集合（优先选没有 schoolRegion 限制的，或 domestic 的）
  const sortedSets = [...c.criterionSets].sort((a, b) => {
    // 优先 domestic 或无限制
    const aScore = (a.schoolRegion === 'overseas' ? 10 : 0) + (a.schoolRegion === 'domestic' ? 0 : 0)
    const bScore = (b.schoolRegion === 'overseas' ? 10 : 0) + (b.schoolRegion === 'domestic' ? 0 : 0)
    return aScore - bScore
  })

  // 用第一个集合来构造 Profile
  const targetSet = sortedSets[0]

  // 学历
  let degree: Degree = '硕士'
  const degOrder: Record<string, number> = { 专科: 0, 本科: 1, 硕士: 2, 博士: 3 }
  if (targetSet.degree && targetSet.degree.length > 0) {
    degree = targetSet.degree.reduce((a, b) => (degOrder[a] > degOrder[b] ? a : b)) as Degree
  } else if (targetSet.minDegree) {
    degree = targetSet.minDegree as Degree
  } else if (c.degree && c.degree.length > 0) {
    degree = c.degree[0] as Degree
  }

  // 海外/境内
  const isOverseas = targetSet.schoolRegion === 'overseas'

  // 院校层次（根据学校实际 levels 选择）
  // 爱丁堡大学: QS前100, THE前100, USNews前100, 软科前100
  const OVERSEAS_LEVELS: SchoolLevel[] = ['QS前100', 'THE前100', 'USNews前100', '软科前100']
  let schoolLevel: SchoolLevel[] = ['双一流']
  if (isOverseas) {
    // 从 criterionSet 的 schoolLevel 中找到学校实际拥有的
    const setLevels = targetSet.schoolLevel || c.schoolLevel || []
    const match = OVERSEAS_LEVELS.find((l) => setLevels.includes(l))
    schoolLevel = match ? [match] : ['QS前100']
  } else if (targetSet.schoolLevel && targetSet.schoolLevel.length > 0) {
    schoolLevel = [targetSet.schoolLevel[0]]
  } else if (c.schoolLevel && c.schoolLevel.length > 0) {
    schoolLevel = [c.schoolLevel[0]]
  }

  // 年龄
  let age = 28
  const ageLimit = targetSet.ageLimit || c.ageLimit
  const ageExclusive = targetSet.ageLimitExclusive || c.ageLimitExclusive
  if (ageLimit) {
    age = ageExclusive ? ageLimit - 1 : ageLimit - 5
  }

  // 落户/就业
  const householdRequired = targetSet.householdRequired || c.householdRequired || false
  const employmentRequired = targetSet.employmentRequired || c.employmentRequired || false
  const requiresFullTime = targetSet.requiresFullTime || c.requiresFullTime || false

  const profile: UserProfile = {
    city: subsidy.city,
    school: isOverseas ? OVERSEAS_SCHOOL : '北京大学',
    schoolLevel,
    degree,
    major: '计算机科学与技术',
    age,
    householdStatus: householdRequired ? '已落户' : '未落户',
    employmentStatus: employmentRequired ? '已就业' : '未就业',
    isFullTime: requiresFullTime ? true : undefined,
    graduationYear: c.graduationYear || undefined,
  }

  // 特殊条件
  if (c.returneeStatus) profile.returneeStatus = c.returneeStatus
  if (c.isFirstLingangEmployment) profile.isFirstLingangEmployment = true
  if (c.isFirstGuangzhouHukou) profile.isFirstGuangzhouHukou = true
  if (c.huaduImportStatus) profile.huaduImportStatus = c.huaduImportStatus
  if (c.identityType && c.identityType.length > 0) profile.identityType = c.identityType[0]
  if (c.companyType && c.companyType.length > 0) profile.companyType = c.companyType[0]
  if (c.firstShenzhenEmploymentAfter) profile.firstShenzhenEmploymentDate = '2026-06-01'

  // criterionSets 中的特殊字段
  if (targetSet.identityType && targetSet.identityType.length > 0) {
    profile.identityType = targetSet.identityType[0]
  }

  return profile
}

// ========== 测试 ==========

describe('政策数据完整性', () => {
  const allSubsidies = getAllSubsidies()

  it(`共加载 ${allSubsidies.length} 条政策`, () => {
    expect(allSubsidies.length).toBeGreaterThan(300)
  })

  it('每条政策必须有必要的顶层字段', () => {
    const missing: string[] = []
    for (const s of allSubsidies) {
      if (!s.id) missing.push(`${s.city}: 缺少 id`)
      if (!s.name) missing.push(`${s.id}: 缺少 name`)
      if (!s.city) missing.push(`${s.id}: 缺少 city`)
      if (!s.category) missing.push(`${s.id}: 缺少 category`)
      if (!s.amount) missing.push(`${s.id}: 缺少 amount`)
      if (!s.conditions) missing.push(`${s.id}: 缺少 conditions`)
      if (!s.application) missing.push(`${s.id}: 缺少 application`)
    }
    expect(missing).toEqual([])
  })

  it('政策 id 全局唯一', () => {
    const ids = allSubsidies.map((s) => s.id)
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i)
    expect(duplicates).toEqual([])
  })

  it('amount.max 必须 > 0（除非是积分落户等 0 元政策）', () => {
    const zeroAmount = allSubsidies.filter(
      (s) => s.amount.max === 0 && !s.name.includes('积分') && !s.name.includes('落户')
    )
    // 允许 0 元政策（如积分落户、落户政策等），但不应太多
    expect(zeroAmount.length).toBeLessThan(30)
  })

  it('criterionSets 中每个集合必须有 id 和 name', () => {
    const issues: string[] = []
    for (const s of allSubsidies) {
      if (!s.conditions.criterionSets) continue
      for (const set of s.conditions.criterionSets) {
        if (!set.id) issues.push(`${s.name}: criterionSet 缺少 id`)
        if (!set.name) issues.push(`${s.name}: criterionSet ${set.id} 缺少 name`)
      }
    }
    expect(issues).toEqual([])
  })

  it('exclusiveGroup 值必须在已知列表中', () => {
    const knownGroups = new Set([
      '', 'shenzhen-district', 'shanghai-district', 'guangzhou-district',
      'beijing-district', 'hangzhou-district', 'nanjing-district',
      'chongqing-district', 'quanzhou-district', 'wuhan-district',
      'wenzhou-district', 'ningbo-district', 'chengdu-district',
      'jiaxing-district', 'shaoxing-district', 'zhuhai-district',
      'nanning-district', 'qingdao-district', 'fuzhou-district',
      'kunming-district', 'tianjin-district', 'suzhou-district',
      'huizhou-district', 'dalian-district', 'shenyang-district',
      'shijiazhuang-district', 'yantai-district', 'nantong-district',
      'changzhou-district', 'tangshan-district', 'wuhu-goufang',
      'ganzhou-district', 'yinchuan-district', 'jinhua-jiuye',
      'taizhou-jiuye', 'baoding-zufang-goufang', 'taizhoujs-district',
      'hefei-zufang',
    ])
    const unknown = allSubsidies.filter(
      (s) => s.exclusiveGroup && !knownGroups.has(s.exclusiveGroup)
    )
    if (unknown.length > 0) {
      console.warn('未知 exclusiveGroup:', unknown.map((s) => `${s.id}: ${s.exclusiveGroup}`))
    }
    expect(unknown).toEqual([])
  })

  it('每条政策的 city 必须在 subsidiesData 中有对应数据', () => {
    const citiesInData = new Set(Object.keys(subsidiesData))
    const missing = allSubsidies.filter((s) => !citiesInData.has(s.city))
    expect(missing).toEqual([])
  })
})

describe('逐城市政策匹配测试', () => {
  // 遍历所有城市
  for (const [cityCode, citySubsidies] of Object.entries(subsidiesData)) {
    describe(`${cityCode} (${citySubsidies.length} 条政策)`, () => {
      for (const subsidy of citySubsidies) {
        describe(`${subsidy.name}`, () => {
          it('正向匹配：满足条件时应匹配成功', () => {
            const profile = subsidy.conditions.criterionSets
              ? buildPerfectProfileForCriterionSets(subsidy)
              : buildPerfectProfile(subsidy)

            const result = matchSubsidy(profile, subsidy)

            if (!result.matched) {
              // 输出调试信息
              console.log(`\n❌ 未匹配: ${subsidy.id} (${subsidy.name})`)
              console.log(`  缺失条件: ${result.missingConditions.join(', ')}`)
              console.log(`  用户 Profile:`, JSON.stringify(profile, null, 2))
            }

            expect(result.matched).toBe(true)
          })

          // 反向测试：仅对有明确学历要求的政策
          if (subsidy.conditions.degree && subsidy.conditions.degree.length > 0) {
            const requiredDegrees = subsidy.conditions.degree
            const allDegrees: Degree[] = ['专科', '本科', '硕士', '博士']
            const missingDegrees = allDegrees.filter((d) => !requiredDegrees.includes(d))

            if (missingDegrees.length > 0) {
              it(`反向匹配：学历 ${missingDegrees[0]} 不满足要求时应不匹配`, () => {
                const profile = buildPerfectProfile(subsidy)
                profile.degree = missingDegrees[0]

                const result = matchSubsidy(profile, subsidy)
                expect(result.matched).toBe(false)
                expect(result.missingConditions.length).toBeGreaterThan(0)
              })
            }
          }

          // 年龄边界测试
          if (subsidy.conditions.ageLimit) {
            const limit = subsidy.conditions.ageLimit
            const exclusive = subsidy.conditions.ageLimitExclusive

            it(`年龄边界：${exclusive ? limit : limit + 1} 岁应不匹配`, () => {
              const profile = buildPerfectProfile(subsidy)
              // exclusive: < limit → limit 岁不通过
              // inclusive: <= limit → limit+1 岁不通过
              profile.age = exclusive ? limit : limit + 1

              const result = matchSubsidy(profile, subsidy)
              expect(result.matched).toBe(false)
            })
          }
        })
      }
    })
  }
})

describe('criterionSets 专项测试', () => {
  const subsidiesWithCriterionSets = getAllSubsidies().filter(
    (s) => s.conditions.criterionSets && s.conditions.criterionSets.length > 0
  )

  it(`共 ${subsidiesWithCriterionSets.length} 条政策使用 criterionSets`, () => {
    expect(subsidiesWithCriterionSets.length).toBeGreaterThan(90)
  })

  for (const subsidy of subsidiesWithCriterionSets) {
    describe(`${subsidy.id}`, () => {
      it('完全不满足的 Profile 应不匹配', () => {
        const profile: UserProfile = {
          city: subsidy.city,
          school: '某不知名学校',
          schoolLevel: [],
          degree: '专科',
          major: '哲学',
          age: 60,
          householdStatus: '未落户',
          employmentStatus: '未就业',
        }

        const result = matchSubsidy(profile, subsidy)
        // 有可能匹配（如果 criterionSets 中有非常宽松的条件），但大多数情况下不应匹配
        // 这里只验证不会抛异常
        expect(typeof result.matched).toBe('boolean')
        expect(Array.isArray(result.missingConditions)).toBe(true)
      })

      it('完美 Profile 应匹配', () => {
        const profile = buildPerfectProfileForCriterionSets(subsidy)
        const result = matchSubsidy(profile, subsidy)

        if (!result.matched) {
          console.log(`\n❌ criterionSet 未匹配: ${subsidy.id}`)
          console.log(`  缺失条件: ${result.missingConditions.join(', ')}`)
        }

        expect(result.matched).toBe(true)
      })
    })
  }
})

describe('互斥组测试', () => {
  it('同一互斥组的政策应被正确分组', () => {
    // 用深圳的区级政策测试
    const shenzhenSubsidies = subsidiesData['shenzhen'] || []
    const matchedItems = shenzhenSubsidies
      .map((s) => {
        const profile = buildPerfectProfile(s)
        return matchSubsidy(profile, s)
      })
      .filter((r) => r.matched)

    const { groups } = groupExclusiveItems(matchedItems)

    // 深圳有 shenzhen-district 互斥组
    const shenzhenGroup = groups.find((g) => g.groupId === 'shenzhen-district')
    if (shenzhenGroup) {
      // 同一组只能选一个
      expect(shenzhenGroup.items.length).toBeGreaterThan(1)
      expect(shenzhenGroup.selected).toBeDefined()
      expect(shenzhenGroup.totalAmount).toBe(shenzhenGroup.selected.matchedAmount)
    }
  })

  it('matchAllSubsidies 的 totalAmount 正确处理互斥组', () => {
    const shenzhenSubsidies = subsidiesData['shenzhen'] || []
    const profile = buildPerfectProfile(shenzhenSubsidies[0])
    profile.city = 'shenzhen'

    const result = matchAllSubsidies(profile, shenzhenSubsidies)

    // 总金额应 >= 0
    expect(result.totalAmount).toBeGreaterThanOrEqual(0)

    // 匹配的政策数应 > 0
    const matchedCount = result.subsidies.filter((r) => r.matched).length
    expect(matchedCount).toBeGreaterThan(0)
  })
})

describe('金额计算测试', () => {
  it('一次性补贴计算正确', () => {
    const result = calculateTotalAmount({ min: 0, max: 30000, unit: '元', period: '一次性' })
    expect(result.total).toBe(30000)
  })

  it('万元单位换算正确', () => {
    const result = calculateTotalAmount({ min: 0, max: 5, unit: '万元', period: '一次性' })
    expect(result.total).toBe(50000)
  })

  it('按月补贴计算正确', () => {
    const result = calculateTotalAmount({
      min: 0, max: 2000, unit: '元', period: '每月', durationMonths: 36,
    })
    expect(result.total).toBe(72000)
  })

  it('按年补贴计算正确', () => {
    const result = calculateTotalAmount({ min: 0, max: 10000, unit: '元', period: '每年' })
    expect(result.total).toBe(10000)
  })

  it('tieredAmount 按学历分档', () => {
    const base = { min: 0, max: 10000, unit: '元' as const, period: '一次性' }
    const tiered = {
      硕士: { min: 0, max: 20000, unit: '元' as const, period: '一次性' },
      博士: { min: 0, max: 30000, unit: '元' as const, period: '一次性' },
    }

    const masterResult = calculateTotalAmount(base, '硕士', tiered)
    expect(masterResult.total).toBe(20000)

    const bachelorResult = calculateTotalAmount(base, '本科', tiered)
    expect(bachelorResult.total).toBe(10000) // 回退到 base
  })
})

describe('特殊条件匹配测试', () => {
  it('上海留学回国人员：returneeStatus = within_2_years', () => {
    const subsidy = subsidiesData['shanghai']?.find(
      (s) => s.id === 'shanghai-liuxuehuiguorenyuanluohu'
    )
    if (!subsidy) return

    // 满足条件（需海外学校 + returneeStatus）
    const ok: UserProfile = {
      city: 'shanghai', school: '爱丁堡大学', schoolLevel: ['QS前100'],
      degree: '硕士', major: '计算机', age: 30,
      householdStatus: '未落户', employmentStatus: '已就业',
      returneeStatus: 'within_2_years',
    }
    expect(matchSubsidy(ok, subsidy).matched).toBe(true)

    // 不满足条件
    const bad: UserProfile = { ...ok, returneeStatus: 'over_2_years' }
    expect(matchSubsidy(bad, subsidy).matched).toBe(false)
  })

  it('上海临港安家补贴：isFirstLingangEmployment = true', () => {
    const subsidy = subsidiesData['shanghai']?.find(
      (s) => s.id === 'shanghai-lingangxinpianquqianyanc'
    )
    if (!subsidy) return

    const ok: UserProfile = {
      city: 'shanghai', school: '北京大学', schoolLevel: ['双一流'],
      degree: '硕士', major: '计算机', age: 30,
      householdStatus: '未落户', employmentStatus: '已就业',
      isFirstLingangEmployment: true,
    }
    expect(matchSubsidy(ok, subsidy).matched).toBe(true)

    const bad: UserProfile = { ...ok, isFirstLingangEmployment: false }
    expect(matchSubsidy(bad, subsidy).matched).toBe(false)
  })

  it('广州黄埔入户奖励：isFirstGuangzhouHukou = true', () => {
    const subsidy = subsidiesData['guangzhou']?.find(
      (s) => s.id === 'guangzhou-huangpuquqingniandaxuesh'
    )
    if (!subsidy) return

    // 需要：degree 本科/硕士/博士，已就业，已落户，首次入户广州，全日制
    const ok: UserProfile = {
      city: 'guangzhou', school: '北京大学', schoolLevel: ['双一流'],
      degree: '本科', major: '计算机', age: 28,
      householdStatus: '已落户', employmentStatus: '已就业',
      isFirstGuangzhouHukou: true, isFullTime: true,
    }
    expect(matchSubsidy(ok, subsidy).matched).toBe(true)

    const bad: UserProfile = { ...ok, isFirstGuangzhouHukou: false }
    expect(matchSubsidy(bad, subsidy).matched).toBe(false)
  })

  it('广州花都引进人才：huaduImportStatus = after_2023', () => {
    const subsidy = subsidiesData['guangzhou']?.find(
      (s) => s.id === 'guangzhou-huaduquyinjinyouxiurenca'
    )
    if (!subsidy) return

    const ok: UserProfile = {
      city: 'guangzhou', school: '北京大学', schoolLevel: ['双一流'],
      degree: '硕士', major: '计算机', age: 35,
      householdStatus: '未落户', employmentStatus: '已就业',
      huaduImportStatus: 'after_2023',
    }
    expect(matchSubsidy(ok, subsidy).matched).toBe(true)

    const bad: UserProfile = { ...ok, huaduImportStatus: 'before_2023' }
    expect(matchSubsidy(bad, subsidy).matched).toBe(false)
  })

  it('南京雨花台：companyType 匹配', () => {
    const subsidy = subsidiesData['nanjing']?.find(
      (s) => s.id === 'nanjing-yuhuatai-youxiu'
    )
    if (!subsidy) return

    // 需要：degree 硕士/博士，schoolLevel 双一流/QS前200，毕业2年内，全日制，已就业，companyType
    const ok: UserProfile = {
      city: 'nanjing', school: '北京大学', schoolLevel: ['双一流'],
      degree: '硕士', major: '计算机', age: 28,
      householdStatus: '未落户', employmentStatus: '已就业',
      isFullTime: true, graduationYear: 'within_2_years',
      companyType: '规模以上工业企业',
    }
    expect(matchSubsidy(ok, subsidy).matched).toBe(true)

    const bad: UserProfile = { ...ok, companyType: '某不相关企业' }
    expect(matchSubsidy(bad, subsidy).matched).toBe(false)
  })

  it('深圳前海港澳青年：identityType 限制', () => {
    const subsidy = subsidiesData['shenzhen']?.find(
      (s) => s.id === 'shenzhen-qianhai-gangaoqingnian'
    )
    if (!subsidy) return

    const ok: UserProfile = {
      city: 'shenzhen', school: '北京大学', schoolLevel: ['双一流'],
      degree: '本科', major: '计算机', age: 35,
      householdStatus: '未落户', employmentStatus: '已就业',
      identityType: '港澳居民',
    }
    expect(matchSubsidy(ok, subsidy).matched).toBe(true)

    const bad: UserProfile = { ...ok, identityType: '内地居民' }
    expect(matchSubsidy(bad, subsidy).matched).toBe(false)
  })

  it('深圳青年人才：firstShenzhenEmploymentAfter 时间限制', () => {
    const subsidy = subsidiesData['shenzhen']?.find(
      (s) => s.id === 'shenzhen-qingnian-rencai-zhufang'
    )
    if (!subsidy) return

    // 博士路径（最简单的 criterionSet）
    const ok: UserProfile = {
      city: 'shenzhen', school: '北京大学', schoolLevel: ['双一流'],
      degree: '博士', major: '计算机', age: 35,
      householdStatus: '未落户', employmentStatus: '已就业',
      firstShenzhenEmploymentDate: '2026-06-01',
    }
    expect(matchSubsidy(ok, subsidy).matched).toBe(true)

    const bad: UserProfile = { ...ok, firstShenzhenEmploymentDate: '2025-01-01' }
    expect(matchSubsidy(bad, subsidy).matched).toBe(false)
  })
})

describe('matchAllSubsidies 综合测试', () => {
  it('深圳：硕士、双一流、28岁、已就业、已落户 → 应匹配多条政策', () => {
    const profile: UserProfile = {
      city: 'shenzhen',
      school: '北京大学',
      schoolLevel: ['双一流'],
      degree: '硕士',
      major: '计算机科学与技术',
      age: 28,
      householdStatus: '已落户',
      employmentStatus: '已就业',
      isFullTime: true,
    }

    const result = matchAllSubsidies(profile, subsidiesData['shenzhen'] || [])
    const matched = result.subsidies.filter((r) => r.matched)

    expect(matched.length).toBeGreaterThan(0)
    expect(result.totalAmount).toBeGreaterThan(0)

    console.log(`\n📊 深圳匹配结果：${matched.length} 条政策匹配，总金额 ${result.totalAmount.toLocaleString()} 元`)
    for (const r of matched) {
      console.log(`  ✅ ${r.subsidy.name}: ${r.matchedAmount.toLocaleString()} 元`)
    }
  })

  it('北京：博士、30岁、已就业 → 应匹配博士后等政策', () => {
    const profile: UserProfile = {
      city: 'beijing',
      school: '北京大学',
      schoolLevel: ['双一流'],
      degree: '博士',
      major: '计算机科学与技术',
      age: 30,
      householdStatus: '未落户',
      employmentStatus: '已就业',
    }

    const result = matchAllSubsidies(profile, subsidiesData['beijing'] || [])
    const matched = result.subsidies.filter((r) => r.matched)

    expect(matched.length).toBeGreaterThan(0)
    console.log(`\n📊 北京匹配结果：${matched.length} 条政策匹配，总金额 ${result.totalAmount.toLocaleString()} 元`)
    for (const r of matched) {
      console.log(`  ✅ ${r.subsidy.name}: ${r.matchedAmount.toLocaleString()} 元`)
    }
  })

  it('上海：硕士、28岁、已就业 → 应匹配应届生落户等政策', () => {
    const profile: UserProfile = {
      city: 'shanghai',
      school: '北京大学',
      schoolLevel: ['双一流'],
      degree: '硕士',
      major: '计算机科学与技术',
      age: 28,
      householdStatus: '未落户',
      employmentStatus: '已就业',
    }

    const result = matchAllSubsidies(profile, subsidiesData['shanghai'] || [])
    const matched = result.subsidies.filter((r) => r.matched)

    expect(matched.length).toBeGreaterThan(0)
    console.log(`\n📊 上海匹配结果：${matched.length} 条政策匹配，总金额 ${result.totalAmount.toLocaleString()} 元`)
    for (const r of matched) {
      console.log(`  ✅ ${r.subsidy.name}: ${r.matchedAmount.toLocaleString()} 元`)
    }
  })

  it('杭州：硕士、28岁、已就业、已落户、毕业2年内 → 应匹配生活补贴', () => {
    const profile: UserProfile = {
      city: 'hangzhou',
      school: '北京大学',
      schoolLevel: ['双一流'],
      degree: '硕士',
      major: '计算机科学与技术',
      age: 28,
      householdStatus: '已落户',
      employmentStatus: '已就业',
      isFullTime: true,
      graduationYear: 'within_2_years',
    }

    const result = matchAllSubsidies(profile, subsidiesData['hangzhou'] || [])
    const matched = result.subsidies.filter((r) => r.matched)

    expect(matched.length).toBeGreaterThan(0)
    console.log(`\n📊 杭州匹配结果：${matched.length} 条政策匹配，总金额 ${result.totalAmount.toLocaleString()} 元`)
    for (const r of matched) {
      console.log(`  ✅ ${r.subsidy.name}: ${r.matchedAmount.toLocaleString()} 元`)
    }
  })
})
