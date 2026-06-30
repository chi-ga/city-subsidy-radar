import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useResultStore } from '../../stores';
import { useUserStore } from '../../stores';
import { useSchoolSearch, useSubsidyMatch, useMajorSearch } from '../../hooks';
import { getEffectiveConditions, getLocationsForCity, checkShenzhenKeyIndustryMajor } from '../../data';
import { getCachedFlatMajors } from '../../data/lazyMajors';
import { isDoubleFirstClassDiscipline } from '../../data/lazyTalent';
import {
  loadTopStudentPlanBases,
  loadDoubleFirstClassDisciplines,
  schoolHasTopStudentPlan,
  getBasesForSchool,
  isOverseasSchool,
  INNOVATION_ABILITY_OPTIONS,
  INNOVATION_CONTRIBUTION_OPTIONS,
} from '../../data/lazyTalent';
import { loadSchoolsData } from '../../data/lazySchools';
import { CITY_NAMES, deduplicateLevels } from '../../constants';
import { loadFormCache, saveFormCache, clearFormCache } from '../../utils/formCache';
import type { CityCode, SchoolLevel } from '../../constants';
import type { UserProfile } from '../../types';
import type { TopStudentPlanBase } from '../../data/lazyTalent';

export default function Input() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'single';
  const preselectedCity = searchParams.get('city') as CityCode | undefined;

  const { setLoading, setResult, setCompareResults, setError, error: matchError, isLoading } = useResultStore();
  const { setProfile, resetProfile } = useUserStore();
  const { results, isSearching: schoolSearching, search, clear } = useSchoolSearch();
  const { results: majorResults, isSearching: majorSearching, search: searchMajors, clear: clearMajors } = useMajorSearch();

  // 点击外部关闭下拉框
  const schoolDropdownRef = useRef<HTMLDivElement>(null);
  const majorDropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(e.target as Node)) {
      setShowSchoolDropdown(false);
    }
    if (majorDropdownRef.current && !majorDropdownRef.current.contains(e.target as Node)) {
      setShowMajorDropdown(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);
  const { match, matchMultipleCities } = useSubsidyMatch();

  // 默认空表单
  const emptyForm: Partial<UserProfile> = {
    city: preselectedCity,
    school: '',
    schoolLevel: [],
    degree: undefined,
    major: '',
    age: undefined as unknown as number,
    graduationYear: undefined,
    householdStatus: undefined,
    employmentStatus: undefined,
    district: undefined,
    majorFirstLevelDiscipline: undefined,
    majorInShenzhenKeyIndustry: undefined,
    isStemMajor: undefined,
    inTopStudentPlan: undefined,
    topStudentPlanBase: undefined,
    hasInnovationAbility: undefined,
    hasInnovationContribution: undefined,
    identityType: undefined,
    firstShenzhenEmploymentDate: undefined,
    // 新增字段
    isFirstGuangzhouHukou: undefined,
    returneeStatus: undefined,
    isFirstLingangEmployment: undefined,
    isInThreeCitiesOneDistrict: undefined,
    huaduImportStatus: undefined,
    hasDoubleDegree: undefined,
    isFullTime: undefined,
  };

  // 从 sessionStorage 恢复上次填写的内容（如有）
  const cached = loadFormCache();
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    ...emptyForm,
    ...(cached || {}),
    // URL 参数优先于缓存
    city: preselectedCity || cached?.city,
    // 过滤掉旧缓存中可能存在的占位字符串，避免污染输入框
    major: cached?.major === '未填写' ? '' : cached?.major,
  });

  // 字段级错误状态：{ fieldName: '错误信息' }
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'age':
        if (value === undefined || value === null || value === '') return '请填写年龄';
        if (value < 18 || value > 50) return '年龄需在 18-50 之间';
        return '';
      case 'degree':
        return !value ? '请选择学历' : '';
      case 'school':
        return !value ? '请输入毕业院校' : '';
      case 'graduationYear':
        return !value ? '请选择毕业年份' : '';
      default:
        return '';
    }
  };
  const handleBlur = (field: string, value: any) => {
    const err = validateField(field, value);
    setFieldErrors((prev) => ({ ...prev, [field]: err }));
  };
  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // 确认弹窗状态
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [showMajorDropdown, setShowMajorDropdown] = useState(false);
  const [topStudentBases, setTopStudentBases] = useState<TopStudentPlanBase[]>([]);
  // 深圳重点产业目录匹配详情（区分专业直接命中 vs 一级学科命中）
  const [keyIndustryMatchSource, setKeyIndustryMatchSource] = useState<'major' | 'discipline' | null>(null);
  const [keyIndustryMatchedDiscipline, setKeyIndustryMatchedDiscipline] = useState<string | undefined>();
  // 双一流学科匹配结果
  const [doubleFirstClassMatch, setDoubleFirstClassMatch] = useState<boolean | undefined>();

  const conditions = getEffectiveConditions(formData.city, formData.district);

  // 对比模式专用条件：只收集硬性条件，不收集软性条件
  const compareConditions = {
    degree: true,
    schoolLevel: true,
    ageLimit: true,
    graduationYear: true,
    employmentRequired: false,
    householdRequired: false,
    major: true,
    showIdentityType: false,
    showThreeCitiesOneDistrict: false,
    showReturneeStatus: false,
    showFirstLingangEmployment: false,
    showFirstGuangzhouHukou: false,
    showHuaduImportStatus: false,
  };

  // 实际使用的条件配置
  const activeConditions = mode === 'compare' ? compareConditions : conditions;

  // 防抖自动缓存：表单数据变化 1 秒后自动保存到 sessionStorage
  useEffect(() => {
    const timer = setTimeout(() => saveFormCache(formData), 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  // 预加载深圳青年人才认定相关数据
  useEffect(() => {
    loadTopStudentPlanBases().catch(() => {});
    loadDoubleFirstClassDisciplines().catch(() => {});
    loadSchoolsData().catch(() => {});
  }, []);

  useEffect(() => {
    if (preselectedCity) {
      setFormData((prev) => ({ ...prev, city: preselectedCity as CityCode }));
    }
  }, [preselectedCity]);

  // 学历/专业/学校变化时，重新判断重点产业目录和双一流学科
  useEffect(() => {
    if (formData.city !== 'shenzhen' || !formData.major) return;
    const major = formData.major;
    const firstLevel = formData.majorFirstLevelDiscipline;
    const degree = formData.degree;
    const school = formData.school;
    (async () => {
      try {
        // 重点产业目录（edu-3 / edu-5-domestic 路径）
        const r = await checkShenzhenKeyIndustryMajor(major, firstLevel, degree);
        setKeyIndustryMatchSource(r.matchSource);
        setKeyIndustryMatchedDiscipline(r.matchedDiscipline);
        setFormData((prev) => ({ ...prev, majorInShenzhenKeyIndustry: r.inKeyIndustry || undefined }));
      } catch { /* 静默失败 */ }
      // 双一流学科（edu-4 路径）：需确保缓存已加载再同步判断
      try {
        await loadDoubleFirstClassDisciplines();
        const isDFC = firstLevel && school
          ? isDoubleFirstClassDiscipline(school, firstLevel)
          : false;
        setDoubleFirstClassMatch(isDFC);
      } catch { /* 静默失败 */ }
    })();
  }, [formData.degree, formData.major, formData.school]);

  // 当城市或区域切换时，为不使用的条件字段填充默认值，避免影响匹配
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      major: activeConditions.major ? prev.major || '' : '',
      graduationYear: activeConditions.graduationYear ? prev.graduationYear : undefined,
      householdStatus: activeConditions.householdRequired
        ? prev.householdStatus || undefined
        : ('未落户' as UserProfile['householdStatus']),
      employmentStatus: activeConditions.employmentRequired
        ? prev.employmentStatus || undefined
        : ('未就业' as UserProfile['employmentStatus']),
      // 身份类型：仅前海等区域需要，切到不需要的区域时清空
      identityType: activeConditions.showIdentityType ? prev.identityType : undefined,
      // 首次在深就业创业时间：仅深圳需要
      firstShenzhenEmploymentDate: prev.city === 'shenzhen' ? prev.firstShenzhenEmploymentDate : undefined,
      // 新增字段：切城市/区域时重置
      isFirstGuangzhouHukou: activeConditions.showFirstGuangzhouHukou ? prev.isFirstGuangzhouHukou : undefined,
      returneeStatus: activeConditions.showReturneeStatus ? prev.returneeStatus : undefined,
      isFirstLingangEmployment: activeConditions.showFirstLingangEmployment ? prev.isFirstLingangEmployment : undefined,
      isInThreeCitiesOneDistrict: activeConditions.showThreeCitiesOneDistrict ? prev.isInThreeCitiesOneDistrict : undefined,
      huaduImportStatus: activeConditions.showHuaduImportStatus ? prev.huaduImportStatus : undefined,
    }));
  }, [formData.city, formData.district, mode]);

  const handleSchoolInput = (value: string) => {
    setFormData((prev) => ({ ...prev, school: value, schoolLevel: [] }));
    if (value.length >= 1) {
      search(value);
      setShowSchoolDropdown(true);
    } else {
      clear();
      setShowSchoolDropdown(false);
    }
  };

  const handleSchoolSelect = (schoolName: string, levels: SchoolLevel[]) => {
    const bases = schoolHasTopStudentPlan(schoolName) ? getBasesForSchool(schoolName) : [];
    setTopStudentBases(bases);
    setFormData((prev) => ({
      ...prev,
      school: schoolName,
      schoolLevel: deduplicateLevels(levels),
      // 高校换了，拔尖计划/STEM等选择需要重置
      inTopStudentPlan: undefined,
      topStudentPlanBase: undefined,
      // 切换学校时清掉 STEM 选择（境外200榜单专用）
      isStemMajor: undefined,
    }));
    clear();
    setShowSchoolDropdown(false);
  };

  const handleMajorInput = (value: string) => {
    setFormData((prev) => ({ ...prev, major: value }));
    setKeyIndustryMatchSource(null);
    setKeyIndustryMatchedDiscipline(undefined);
    if (value.length >= 1) {
      searchMajors(value);
      setShowMajorDropdown(true);
    } else {
      clearMajors();
      setShowMajorDropdown(false);
    }
  };

  const handleMajorSelect = async (majorName: string, firstLevelDiscipline?: string) => {
    // 同步回填一级学科（用于双一流学科匹配）
    let firstLevel = firstLevelDiscipline;
    if (!firstLevel) {
      // 从已缓存的扁平专业列表里查
      const flat = getCachedFlatMajors();
      firstLevel = flat.find((m) => m.name === majorName)?.first_level_discipline;
    }
    // 异步判定是否在重点产业领域专业目录内
    // 本科：专业名在 undergraduate_majors 列表
    // 研究生：一级学科在 graduate_disciplines 列表
    let inKeyIndustry: boolean | undefined;
    let matchSrc: 'major' | 'discipline' | null = null;
    let matchedDisc: string | undefined;
    try {
      const r = await checkShenzhenKeyIndustryMajor(majorName, firstLevel, formData.degree);
      inKeyIndustry = r.inKeyIndustry;
      matchSrc = r.matchSource;
      matchedDisc = r.matchedDiscipline;
    } catch {
      inKeyIndustry = false;
    }
    setKeyIndustryMatchSource(matchSrc);
    setKeyIndustryMatchedDiscipline(matchedDisc);

    // 判断一级学科是否属于该校双一流学科（edu-4 路径）：需确保缓存已加载
    try {
      await loadDoubleFirstClassDisciplines();
    } catch { /* 预加载已执行，此处兜底 */ }
    const isDFC = firstLevel && formData.school
      ? isDoubleFirstClassDiscipline(formData.school, firstLevel)
      : false;
    setDoubleFirstClassMatch(isDFC);
    setFormData((prev) => ({
      ...prev,
      major: majorName,
      majorFirstLevelDiscipline: firstLevel,
      majorInShenzhenKeyIndustry: inKeyIndustry,
    }));
    clearMajors();
    setShowMajorDropdown(false);
  };

  const isFormValid = () => {
    const baseValid =
      !!formData.school &&
      !!formData.degree &&
      formData.age !== undefined &&
      formData.age !== null &&
      formData.age >= 18 &&
      formData.age <= 50;
    // 对比模式下专业为可选；单城模式下按条件配置
    const majorValid = mode === 'compare' ? true : !activeConditions.major || !!formData.major;
    const gradValid = !!formData.graduationYear;
    const householdValid = !activeConditions.householdRequired || !!formData.householdStatus;
    const employmentValid = !activeConditions.employmentRequired || !!formData.employmentStatus;

    const allValid =
      baseValid && majorValid && gradValid && householdValid && employmentValid;

    if (mode === 'single') {
      return allValid && formData.city;
    }
    return allValid;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    // 确保一级学科已解析（用户可能直接输入专业名而未点下拉选项）
    let resolved = { ...formData };
    if (formData.major && !formData.majorFirstLevelDiscipline) {
      const flat = getCachedFlatMajors();
      const found = flat.find((m) => m.name === formData.major);
      if (found) {
        resolved.majorFirstLevelDiscipline = found.first_level_discipline;
        setFormData((prev) => ({ ...prev, majorFirstLevelDiscipline: found.first_level_discipline }));
      }
    }

    // 提交前立即保存缓存，确保返回问卷时能恢复
    saveFormCache(resolved);
    // 同步到 userStore，使 Result 等页面可读取 profile
    setProfile(resolved);

    setLoading(true);

    try {
      let userProfile = resolved as UserProfile;

      if (mode === 'compare') {
        // 对比模式：软性条件按"到了该城市后自然满足"处理，不参与匹配判断
        const isOverseas = isOverseasSchool(userProfile.school);
        userProfile = {
          ...userProfile,
          employmentStatus: '已就业',
          householdStatus: '已落户',
          isFirstGuangzhouHukou: true,
          isFirstLingangEmployment: true,
          huaduImportStatus: 'after_2023',
          isInThreeCitiesOneDistrict: true,
          isFullTime: true,
          firstShenzhenEmploymentDate: new Date().toISOString().split('T')[0],
          // 境外高校默认按留学回国2年内处理，便于上海等地留学生政策匹配
          returneeStatus: isOverseas ? 'within_2_years' : undefined,
        };

        const cities: CityCode[] = ['beijing', 'shanghai', 'shenzhen', 'guangzhou', 'hefei'];
        const compareResults = matchMultipleCities(userProfile, cities);
        setCompareResults(compareResults);
        navigate('/compare');
      } else {
        const result = match(userProfile);
        setResult(result);
        navigate('/result');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '匹配失败');
    }
  };

  const graduationOptions = [
    { value: 'within_2_years' as const, label: '毕业2年内' },
    { value: 'over_2_years' as const, label: '毕业2年以上' },
  ];
  const degrees = ['专科', '本科', '硕士', '博士'] as const;
  const householdOptions = ['已落户', '未落户'] as const;
  const employmentOptions = ['已就业', '未就业'] as const;

  // 进度计算：仅统计当前模式下实际需要用户填写的步骤
  // 对比模式：不收集城市选择和状态信息（软性条件默认满足），只统计院校信息和个人情况
  const progress = mode === 'compare'
    ? [
        { label: '院校信息', done: !!formData.school && !!formData.degree && (!activeConditions.major || !!formData.major) },
        { label: '个人情况', done: !!formData.age && !!formData.graduationYear },
      ]
    : [
        { label: '目标城市', done: !!formData.city },
        { label: '院校信息', done: !!formData.school && !!formData.degree && (!activeConditions.major || !!formData.major) },
        { label: '个人情况', done: !!formData.age && !!formData.graduationYear },
        { label: '状态信息', done: (!activeConditions.householdRequired || !!formData.householdStatus) && (!activeConditions.employmentRequired || !!formData.employmentStatus) },
      ];

  const completedSteps = progress.filter((p) => p.done).length;

  // 分步展开：选城市后才显示后续问卷（compare 模式无需选城市）
  const citySelected = mode === 'compare' || !!formData.city;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3 sm:px-6 sm:py-4">
          <button
            onClick={() => navigate('/')}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 sm:px-3"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">返回首页</span>
          </button>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="shrink-0 whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 sm:px-3"
            >
              重新开始
            </button>
            <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-600">
              {Math.round((completedSteps / progress.length) * 100)}%
            </span>
            <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100 sm:w-32">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 ease-out"
                style={{ width: `${(completedSteps / progress.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-6 sm:px-6 sm:py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === 'compare' ? '城市补贴对比' : '查询可申领补贴'}
          </h1>
          <p className="mt-2 text-slate-500">
            {mode === 'compare'
              ? '输入你的信息，一键对比多城市补贴总额'
              : '输入你的信息，智能匹配可申领的补贴'}
          </p>
        </div>

        <div className="mt-8 space-y-6 sm:mt-10 sm:space-y-8">
          {/* City Selection */}
          {mode === 'single' && (
            <section>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                目标城市
              </label>
              <div className="relative mt-3">
                <select
                  value={formData.city || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value as CityCode }))}
                  className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-10 text-sm text-slate-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                >
                  <option value="" disabled>请选择目标城市</option>
                  {Object.entries(CITY_NAMES).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </section>
          )}

          {/* 未选城市时的引导提示 */}
          {!citySelected && (
            <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-6 py-10 text-center shadow-sm sm:px-8 sm:py-14">
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-blue-100/40 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-cyan-100/40 blur-2xl" />
              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="mt-5 text-xl font-bold text-slate-900">请先选择目标城市</p>
                <p className="mt-2 text-base text-slate-500">选择后将展开问卷填写</p>
              </div>
            </div>
          )}

          {/* 选城市后展开的问卷 */}
          {citySelected && (
          <>
          {/* 对比模式假设说明 */}
          {mode === 'compare' && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-3 text-xs leading-relaxed text-blue-700">
              <span className="font-semibold">对比模式说明：</span>
              系统假设你到达目标城市后会自然满足落户、就业等软性条件，因此对比结果展示的是各城市的"潜力上限"。实际申领还需满足对应条件。
            </div>
          )}

          {/* 目标区域（可选）：仅单城模式显示；对比模式默认全市 */}
          {mode === 'single' && (
          <section>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                目标区域
                <span className="ml-1 text-xs font-normal text-slate-400">（可选）</span>
              </label>
            <div className="mt-3">
              <div className="relative">
                <select
                  value={formData.district || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      district: e.target.value === '' ? undefined : e.target.value,
                    }))
                  }
                  className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-10 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                >
                  <option value="">不限（全市）</option>
                  {getLocationsForCity(formData.city).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                {formData.city
                  ? `当前展示 ${CITY_NAMES[formData.city]} 下辖区/县的补贴，可按需进一步筛选。`
                  : '可先选区再选城市；选区后只展示该区+市级政策。'}
              </p>
            </div>
          </section>
          )}

          {/* School */}
          <section>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                毕业院校
              </label>
            <div className="relative mt-3" ref={schoolDropdownRef}>
              <input
                type="text"
                value={formData.school}
                onChange={(e) => handleSchoolInput(e.target.value)}
                onFocus={() => { if (formData.school && formData.school.length >= 1 && results.length > 0) setShowSchoolDropdown(true); }}
                placeholder="输入院校名称，如：北京大学"
                className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
              />
              {activeConditions.schoolLevel && formData.schoolLevel && formData.schoolLevel.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.schoolLevel.map((level) => (
                    <span
                      key={level}
                      className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                    >
                      {level}
                    </span>
                  ))}
                </div>
              )}
              {showSchoolDropdown && (schoolSearching || results.length > 0) && (
                <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  {schoolSearching ? (
                    <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                      搜索中...
                    </div>
                  ) : (
                    results.map((school) => (
                      <button
                        key={school.id}
                        onClick={() => handleSchoolSelect(school.name, school.levels)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-slate-50"
                      >
                        <span className="font-medium text-slate-800">{school.name}</span>
                        <div className="flex gap-1">
                          {deduplicateLevels(school.levels).map((level) => (
                            <span
                              key={level}
                              className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500"
                            >
                              {level}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Degree */}
          <section>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                学历
              </label>
            <div className="relative mt-3">
              <select
                value={formData.degree || ''}
                onChange={(e) => { setFormData((prev) => ({ ...prev, degree: e.target.value as UserProfile['degree'] })); clearFieldError('degree'); }}
                onBlur={() => handleBlur('degree', formData.degree)}
                className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
              >
                <option value="" disabled>请选择学历</option>
                {degrees.map((degree) => (
                  <option key={degree} value={degree}>
                    {degree}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {/* 双学位复选框：本科/硕士时显示 */}
            {(formData.degree === '本科' || formData.degree === '硕士') && (
              <div className="mt-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/30">
                  <input
                    type="checkbox"
                    checked={formData.hasDoubleDegree === true}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData((prev) => ({
                        ...prev,
                        hasDoubleDegree: checked ? true : undefined,
                      }));
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700">
                    持有双学位
                    <span className="ml-1 text-xs text-slate-400">（部分落户补贴要求双学位才给满额）</span>
                  </span>
                </label>
              </div>
            )}
            {/* 全日制/非全日制复选框：本科及以上时显示 */}
            {formData.degree && formData.degree !== '专科' && (
              <div className="mt-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/30">
                  <input
                    type="checkbox"
                    checked={formData.isFullTime === true}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData((prev) => ({
                        ...prev,
                        isFullTime: checked ? true : undefined,
                      }));
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700">
                    全日制学历
                    <span className="ml-1 text-xs text-slate-400">（部分补贴要求全日制学历方可申领）</span>
                  </span>
                </label>
              </div>
            )}
          </section>

          {/* Major */}
          {activeConditions.major && (
            <section>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                专业
              </label>
              <div className="relative mt-3" ref={majorDropdownRef}>
                <input
                  type="text"
                  value={formData.major}
                  onChange={(e) => handleMajorInput(e.target.value)}
                  onFocus={() => { if (formData.major && formData.major.length >= 1 && majorResults.length > 0) setShowMajorDropdown(true); }}
                  placeholder="输入专业名称，如：计算机科学与技术"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                />
                {showMajorDropdown && (majorSearching || majorResults.length > 0) && (
                  <div className="absolute z-10 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                    {majorSearching ? (
                      <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                        搜索中...
                      </div>
                    ) : (
                      majorResults.slice(0, 20).map((major) => (
                        <button
                          key={major.code}
                          onClick={() => handleMajorSelect(major.name, major.first_level_discipline)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-slate-50"
                        >
                          <span className="font-medium text-slate-800">{major.name}</span>
                          <span className="ml-2 shrink-0 text-xs text-slate-400">
                            {major.first_level_discipline}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
                {showMajorDropdown && !majorSearching && majorResults.length === 0 && formData.major && formData.major.length >= 1 && (
                  <div className="absolute z-10 mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400 shadow-lg">
                    未找到匹配专业，可直接输入或尝试其他关键词
                  </div>
                )}
              </div>
              {formData.city === 'shenzhen' && formData.major && formData.degree && formData.degree !== '专科' && (
                <div className="mt-1.5 space-y-1 text-xs">
                  {/* 重点产业目录（edu-3 / edu-5-domestic 路径） */}
                  <p className={formData.majorInShenzhenKeyIndustry === true ? 'text-green-600' : 'text-orange-500'}>
                    {formData.majorInShenzhenKeyIndustry === true
                      ? keyIndustryMatchSource === 'discipline'
                        ? `✓ 一级学科「${keyIndustryMatchedDiscipline}」属于《重点产业领域专业目录》`
                        : '✓ 专业属于《重点产业领域专业目录》'
                      : '✗ 专业不在《重点产业领域专业目录》'}
                  </p>
                  {/* 双一流学科（edu-4 路径）：需同时有学校和一级学科 */}
                  {formData.school && formData.majorFirstLevelDiscipline && (
                    <p className={doubleFirstClassMatch ? 'text-green-600' : 'text-orange-500'}>
                      {doubleFirstClassMatch
                        ? `✓ 一级学科「${formData.majorFirstLevelDiscipline}」是${formData.school}的双一流学科`
                        : `✗ 一级学科「${formData.majorFirstLevelDiscipline}」不是${formData.school}的双一流学科`}
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          {/* 深圳青年人才认定 · 拔尖计划基地（学校有基地时才显示；对比模式也展示） */}
          {(mode === 'compare' || formData.city === 'shenzhen') && topStudentBases.length > 0 && (
            <section>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                是否入选国家高校拔尖创新人才计划
                <span className="ml-1 text-xs font-normal text-slate-400">
                  （{formData.school} 设有拔尖计划基地）
                </span>
              </label>
              <div className="mt-3">
                <div className="relative">
                  <select
                    value={formData.topStudentPlanBase || ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        topStudentPlanBase: v || undefined,
                        inTopStudentPlan: !!v,
                      }));
                    }}
                    className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  >
                    <option value="">未入选 / 未选择</option>
                    {topStudentBases.map((b) => (
                      <option
                        key={`${b.university}-${b.seq}`}
                        value={b.base_name}
                      >
                        {b.base_name} · {b.category}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </section>
          )}

          {/* 深圳青年人才认定 · STEM 判断（境外高校即显示；单城模式） */}
          {mode === 'single' && formData.city === 'shenzhen' &&
            formData.school &&
            isOverseasSchool(formData.school) && (
              <section>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  所学专业是否属于 STEM（科学/技术/工程/数学）
                </label>
                <p className="mt-1 text-xs text-slate-400">
                  境外高校需自行确认专业是否属于 STEM 范畴
                </p>
                <div className="mt-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/30">
                    <input
                      type="checkbox"
                      checked={formData.isStemMajor === true}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData((prev) => ({
                          ...prev,
                          isStemMajor: checked ? true : undefined,
                        }));
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-700">
                      是，我的专业属于 STEM（科学/技术/工程/数学）
                    </span>
                  </label>
                </div>
              </section>
            )}

          {/* 深圳青年人才认定 · 创新能力类（单城模式） */}
          {mode === 'single' && formData.city === 'shenzhen' && (
            <section>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                创新能力类（符合任一即可）
              </label>
              <p className="mt-1 text-xs text-slate-400">
                获得国内外奖项或参加学科/科技竞赛取得较好成绩
              </p>
              <div className="mt-3">
                <div className="relative">
                  <select
                    value={formData.hasInnovationAbility || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hasInnovationAbility: e.target.value || undefined,
                      }))
                    }
                    className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  >
                    <option value="">不符合 / 未选择</option>
                    <optgroup label="国内外奖项">
                      {INNOVATION_ABILITY_OPTIONS.filter((o) => o.group === '国内外奖项').map((o) => (
                        <option key={o.id} value={o.id}>{o.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="学科竞赛">
                      {INNOVATION_ABILITY_OPTIONS.filter((o) => o.group === '学科竞赛').map((o) => (
                        <option key={o.id} value={o.id}>{o.label}</option>
                      ))}
                    </optgroup>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </section>
          )}

          {/* 深圳青年人才认定 · 创新贡献类（单城模式） */}
          {mode === 'single' && formData.city === 'shenzhen' && (
            <section>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                创新贡献类（符合任一即可）
              </label>
              <p className="mt-1 text-xs text-slate-400">
                创业人才获投资/任职经历，或在 GitHub/Gitee 平台贡献度达标
              </p>
              <div className="mt-3">
                <div className="relative">
                  <select
                    value={formData.hasInnovationContribution || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hasInnovationContribution: e.target.value || undefined,
                      }))
                    }
                    className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  >
                    <option value="">不符合 / 未选择</option>
                    <optgroup label="创业人才">
                      {INNOVATION_CONTRIBUTION_OPTIONS.filter((o) => o.group === '创业人才').map((o) => (
                        <option key={o.id} value={o.id}>{o.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="代码平台贡献">
                      {INNOVATION_CONTRIBUTION_OPTIONS.filter((o) => o.group === '代码平台贡献').map((o) => (
                        <option key={o.id} value={o.id}>{o.label}</option>
                      ))}
                    </optgroup>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </section>
          )}

          {/* 身份类型（港澳台/外籍筛选，仅前海等有港澳台专属政策的区域显示） */}
          {activeConditions.showIdentityType && (
            <section className="animate-fade-slide-in">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                身份类型
                <span className="ml-1 text-xs font-normal text-slate-400">（用于匹配港澳台/外籍专属补贴）</span>
              </label>
              <p className="mt-1 text-xs text-slate-400">
                部分补贴（如前海港澳青年）仅限港澳台居民申领
              </p>
              <div className="mt-3">
                <div className="relative">
                  <select
                    value={formData.identityType || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        identityType: (e.target.value || undefined) as UserProfile['identityType'],
                      }))
                    }
                    className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  >
                    <option value="">内地居民（默认）</option>
                    <option value="港澳居民">港澳居民</option>
                    <option value="台湾居民">台湾居民</option>
                    <option value="外籍人士">外籍人士</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </section>
          )}

          {/* Age & Graduation Year */}
          <section>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                个人情况
              </label>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">年龄</label>
                <input
                  type="number"
                  value={formData.age ?? ''}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === '') {
                      setFormData((prev) => ({ ...prev, age: undefined as unknown as number }));
                      return;
                    }
                    // 允许输入过程中的临时非法值（如 "2"、"22"），由 onBlur 做范围校验
                    const v = Number(raw);
                    if (Number.isNaN(v)) return;
                    setFormData((prev) => ({ ...prev, age: v }));
                    clearFieldError('age');
                  }}
                  onBlur={() => handleBlur('age', formData.age)}
                  placeholder="18-50"
                  min={18}
                  max={50}
                  className={`block w-full rounded-xl border bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/10 ${
                    fieldErrors.age ? 'border-red-300' : 'border-slate-200'
                  }`}
                />
                {fieldErrors.age && (
                  <p className="mt-1.5 text-xs text-red-500">{fieldErrors.age}</p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">毕业年份</label>
                <div className="relative">
                  <select
                    value={formData.graduationYear || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, graduationYear: (e.target.value || undefined) as UserProfile['graduationYear'] }))}
                    className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  >
                    <option value="" disabled>请选择</option>
                    {graduationOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* Status */}
          {(activeConditions.householdRequired || activeConditions.employmentRequired) && (
            <section className="animate-fade-slide-in">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                当前状态
              </label>
              <div className={`mt-3 grid gap-4 ${activeConditions.householdRequired && activeConditions.employmentRequired ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {activeConditions.householdRequired && (
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-500">落户状态</label>
                    <div className="relative">
                      <select
                        value={formData.householdStatus || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, householdStatus: e.target.value as UserProfile['householdStatus'] }))}
                        className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                      >
                        <option value="" disabled>请选择落户状态</option>
                        {householdOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                )}
                {activeConditions.employmentRequired && (
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-500">就业状态</label>
                    <div className="relative">
                      <select
                        value={formData.employmentStatus || ''}
                        onChange={(e) => {
                          const employmentStatus = e.target.value as UserProfile['employmentStatus'];
                          setFormData((prev) => ({
                            ...prev,
                            employmentStatus,
                            // 切回未就业时清空首次在深时间
                            firstShenzhenEmploymentDate: employmentStatus === '未就业' ? undefined : prev.firstShenzhenEmploymentDate,
                          }));
                        }}
                        className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                      >
                        <option value="" disabled>请选择就业状态</option>
                        {employmentOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* 深圳：首次在深就业创业时间（用于判断 2026 青年人才新政） */}
                {formData.city === 'shenzhen' && formData.employmentStatus === '已就业' && (
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs font-medium text-slate-500">
                      首次在深就业创业时间
                      <span className="ml-1 text-[10px] font-normal text-slate-400">（用于匹配 2026 青年人才新政）</span>
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { value: '2026-01-01', label: '2026年1月1日后第一次在深圳工作', desc: '符合新政' },
                        { value: '2025-12-31', label: '2026年1月1日前已在深圳工作过', desc: '不符合新政' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              firstShenzhenEmploymentDate: opt.value || undefined,
                            }))
                          }
                          className={`flex flex-col items-start rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                            (opt.value === '' && !formData.firstShenzhenEmploymentDate) ||
                            formData.firstShenzhenEmploymentDate === opt.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-semibold">{opt.label}</span>
                          <span className="mt-1 text-xs opacity-80">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 北京：三城一区判断（可放宽年龄至50岁） */}
          {activeConditions.showThreeCitiesOneDistrict && formData.city === 'beijing' && (
            <section>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                工作区域
                <span className="ml-1 text-xs font-normal text-slate-400">（可选，影响年龄限制）</span>
              </label>
              <p className="mt-1 text-xs text-slate-400">
                "三城一区"指中关村科学城、怀柔科学城、未来科学城、北京经济技术开发区，可放宽年龄至50周岁
              </p>
              <div className="mt-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/30">
                  <input
                    type="checkbox"
                    checked={formData.isInThreeCitiesOneDistrict === true}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData((prev) => ({
                        ...prev,
                        isInThreeCitiesOneDistrict: checked ? true : undefined,
                      }));
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700">
                    我在"三城一区"工作（中关村科学城/怀柔科学城/未来科学城/北京经济技术开发区）
                  </span>
                </label>
              </div>
            </section>
          )}

          {/* 上海：留学回国时间状态（仅境外高校显示） */}
          {activeConditions.showReturneeStatus && formData.city === 'shanghai' && formData.school && isOverseasSchool(formData.school) && (
            <section className="animate-fade-slide-in">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                留学回国时间
              </label>
              <p className="mt-1 text-xs text-slate-400">
                留学回国人员落户要求回国后两年内来沪工作
              </p>
              <div className="mt-3">
                <div className="relative">
                  <select
                    value={formData.returneeStatus || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, returneeStatus: (e.target.value || undefined) as UserProfile['returneeStatus'] }))}
                    className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  >
                    <option value="" disabled>请选择回国时间</option>
                    <option value="within_2_years">回国2年内</option>
                    <option value="over_2_years">回国2年以上</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </section>
          )}

          {/* 上海临港：首次在临港就业 */}
          {activeConditions.showFirstLingangEmployment && formData.city === 'shanghai' && formData.district === '浦东新区' && (
            <section className="animate-fade-slide-in">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                是否首次在临港就业
              </label>
              <p className="mt-1 text-xs text-slate-400">
                临港安家补贴要求在临港新片区产城融合区首次就业和居住
              </p>
              <div className="mt-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/30">
                  <input
                    type="checkbox"
                    checked={formData.isFirstLingangEmployment === true}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData((prev) => ({
                        ...prev,
                        isFirstLingangEmployment: checked ? true : undefined,
                      }));
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700">
                    是，我是第一次在临港新片区工作和居住
                  </span>
                </label>
              </div>
            </section>
          )}

          {/* 广州黄埔：首次入户广州判断 */}
          {activeConditions.showFirstGuangzhouHukou && formData.city === 'guangzhou' && formData.district === '黄埔区' && (
            <section className="animate-fade-slide-in">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                入户情况
              </label>
              <p className="mt-1 text-xs text-slate-400">
                黄埔入户奖励要求首次入户广州且入户黄埔区
              </p>
              <div className="mt-3">
                <div className="relative">
                  <select
                    value={formData.isFirstGuangzhouHukou === true ? 'yes' : formData.isFirstGuangzhouHukou === false ? 'no' : ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        isFirstGuangzhouHukou: v === 'yes' ? true : v === 'no' ? false : undefined,
                      }));
                    }}
                    className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  >
                    <option value="" disabled>请选择入户情况</option>
                    <option value="yes">首次入户广州（从外地迁入黄埔区）</option>
                    <option value="no">广州户籍迁入黄埔区 / 原本就是黄埔区户籍</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </section>
          )}

          {/* 广州花都：引进时间状态 */}
          {activeConditions.showHuaduImportStatus && formData.city === 'guangzhou' && formData.district === '花都区' && (
            <section className="animate-fade-slide-in">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                引进时间
              </label>
              <p className="mt-1 text-xs text-slate-400">
                花都区引进人才要求2023年1月1日后新引进
              </p>
              <div className="mt-3">
                <div className="relative">
                  <select
                    value={formData.huaduImportStatus || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, huaduImportStatus: (e.target.value || undefined) as UserProfile['huaduImportStatus'] }))}
                    className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  >
                    <option value="" disabled>请选择引进时间</option>
                    <option value="after_2023">2023年1月1日后新引进花都区</option>
                    <option value="before_2023">2023年1月1日前已在花都工作</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </section>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!isFormValid() || isLoading}
            className={`mt-6 w-full rounded-2xl py-4 text-base font-bold transition-all ${
              isFormValid() && !isLoading
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30'
                : 'cursor-not-allowed bg-slate-200 text-slate-400'
            }`}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                匹配中...
              </span>
            ) : (
              mode === 'compare' ? '开始对比' : '开始匹配'
            )}
          </button>

          {/* 匹配错误提示 */}
          {matchError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              匹配出错：{matchError}，请检查信息后重试。
            </div>
          )}

          {/* 重新开始确认弹窗 */}
          {showResetConfirm && (
            <>
              <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
              <div className="fixed left-1/2 top-1/2 z-[101] w-[min(90vw,400px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                <h3 className="text-base font-bold text-slate-900">确认重新开始？</h3>
                <p className="mt-2 text-sm text-slate-500">当前已填写的所有信息将被清空，无法恢复。</p>
                <div className="mt-5 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      clearFormCache();
                      resetProfile();
                      setFormData({ ...emptyForm });
                      setFieldErrors({});
                      setShowResetConfirm(false);
                      window.location.reload();
                    }}
                    className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                  >
                    确认清空
                  </button>
                </div>
              </div>
            </>
          )}
          </>
          )}
        </div>
      </main>
    </div>
  );
}
