import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RadarSpinner } from '../../components/RadarSpinner';
import { useResultStore, useUserStore } from '../../stores';
import { useSchoolSearch, useSubsidyMatch, useMajorSearch } from '../../hooks';
import { getEffectiveConditions, checkShenzhenKeyIndustryMajor } from '../../data';
import { getCachedFlatMajors } from '../../data/lazyMajors';
import { isDoubleFirstClassDiscipline, loadDoubleFirstClassDisciplines, loadTopStudentPlanBases, schoolHasTopStudentPlan, getBasesForSchool, isOverseasSchool } from '../../data/lazyTalent';
import { deduplicateLevels } from '../../constants';
import { loadFormCache, saveFormCache, clearFormCache } from '../../utils/formCache';
import type { CityCode, SchoolLevel } from '../../constants';
import type { UserProfile } from '../../types';
import type { TopStudentPlanBase } from '../../data/lazyTalent';

// 新组件
import { InputHeader } from './components/InputHeader';
import { CitySelector } from './components/CitySelector';
import { DistrictSelector } from './components/DistrictSelector';
import { SchoolSelector } from './components/SchoolSelector';
import { DegreeSelector } from './components/DegreeSelector';
import { MajorSelector } from './components/MajorSelector';
import { PersonalInfoSection } from './components/PersonalInfoSection';
import { StatusSection } from './components/StatusSection';
import { CitySpecialFields } from './components/CitySpecialFields';

export default function Input() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'single';
  const preselectedCity = searchParams.get('city') as CityCode | undefined;
  const from = searchParams.get('from') || '';
  const isFromCompare = from === 'compare';

  const { setLoading, setResult, setCompareResults, setError, error: matchError, isLoading } = useResultStore();
  const { setProfile, resetProfile } = useUserStore();
  const { clear } = useSchoolSearch();
  const { clear: clearMajors } = useMajorSearch();

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
    city: preselectedCity || cached?.city,
    major: cached?.major === '未填写' ? '' : cached?.major,
  });

  // 字段级错误状态
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
  const [topStudentBases, setTopStudentBases] = useState<TopStudentPlanBase[]>([]);
  const [keyIndustryMatchSource, setKeyIndustryMatchSource] = useState<'major' | 'discipline' | null>(null);
  const [keyIndustryMatchedDiscipline, setKeyIndustryMatchedDiscipline] = useState<string | undefined>();
  const [doubleFirstClassMatch, setDoubleFirstClassMatch] = useState<boolean | undefined>();

  const conditions = getEffectiveConditions(formData.city, formData.district);

  // 对比模式专用条件
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
    showCompanyType: false,
    showFullTime: true,
  };

  const activeConditions = mode === 'compare' ? compareConditions : conditions;

  // 防抖自动缓存
  useEffect(() => {
    const timer = setTimeout(() => saveFormCache(formData), 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  // 进入页面滚动到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // 预加载数据
  useEffect(() => {
    loadTopStudentPlanBases().catch(() => {});
    loadDoubleFirstClassDisciplines().catch(() => {});
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
        const r = await checkShenzhenKeyIndustryMajor(major, firstLevel, degree);
        setKeyIndustryMatchSource(r.matchSource);
        setKeyIndustryMatchedDiscipline(r.matchedDiscipline);
        setFormData((prev) => ({ ...prev, majorInShenzhenKeyIndustry: r.inKeyIndustry || undefined }));
      } catch { /* 静默失败 */ }
      try {
        await loadDoubleFirstClassDisciplines();
        const isDFC = firstLevel && school
          ? isDoubleFirstClassDiscipline(school, firstLevel)
          : false;
        setDoubleFirstClassMatch(isDFC);
      } catch { /* 静默失败 */ }
    })();
  }, [formData.degree, formData.major, formData.school]);

  // 当城市或区域切换时，重置不需要的字段
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      major: activeConditions.major ? prev.major || '' : '',
      age: activeConditions.ageLimit ? prev.age : (undefined as unknown as number),
      graduationYear: activeConditions.graduationYear ? prev.graduationYear : undefined,
      householdStatus: activeConditions.householdRequired
        ? prev.householdStatus || undefined
        : ('未落户' as UserProfile['householdStatus']),
      employmentStatus: activeConditions.employmentRequired
        ? prev.employmentStatus || undefined
        : ('未就业' as UserProfile['employmentStatus']),
      hasDoubleDegree: prev.city === 'shenzhen' ? prev.hasDoubleDegree : undefined,
      identityType: activeConditions.showIdentityType ? prev.identityType : undefined,
      firstShenzhenEmploymentDate: prev.city === 'shenzhen' ? prev.firstShenzhenEmploymentDate : undefined,
      isFirstGuangzhouHukou: activeConditions.showFirstGuangzhouHukou ? prev.isFirstGuangzhouHukou : undefined,
      returneeStatus: activeConditions.showReturneeStatus ? prev.returneeStatus : undefined,
      isFirstLingangEmployment: activeConditions.showFirstLingangEmployment ? prev.isFirstLingangEmployment : undefined,
      isInThreeCitiesOneDistrict: activeConditions.showThreeCitiesOneDistrict ? prev.isInThreeCitiesOneDistrict : undefined,
      huaduImportStatus: activeConditions.showHuaduImportStatus ? prev.huaduImportStatus : undefined,
      companyType: activeConditions.showCompanyType ? prev.companyType : undefined,
    }));
  }, [formData.city, formData.district, mode]);

  // 学校选择处理
  const handleSchoolSelect = (schoolName: string, levels: SchoolLevel[]) => {
    const bases = schoolHasTopStudentPlan(schoolName) ? getBasesForSchool(schoolName) : [];
    setTopStudentBases(bases);
    setFormData((prev) => ({
      ...prev,
      school: schoolName,
      schoolLevel: deduplicateLevels(levels),
      inTopStudentPlan: undefined,
      topStudentPlanBase: undefined,
      isStemMajor: undefined,
    }));
    clear();
  };

  // 专业选择处理
  const handleMajorSelect = (majorName: string, firstLevel?: string) => {
    setFormData((prev) => ({
      ...prev,
      major: majorName,
      majorFirstLevelDiscipline: firstLevel,
      majorInShenzhenKeyIndustry: undefined,
    }));
    clearMajors();
  };

  // 表单验证
  const isFormValid = () => {
    const baseValid = !!formData.school && !!formData.degree;
    const ageValid = !activeConditions.ageLimit || (
      formData.age !== undefined &&
      formData.age !== null &&
      formData.age >= 18 &&
      formData.age <= 50
    );
    const majorValid = !activeConditions.major || !!formData.major;
    const gradValid = !activeConditions.graduationYear || !!formData.graduationYear;
    const householdValid = !activeConditions.householdRequired || !!formData.householdStatus;
    const employmentValid = !activeConditions.employmentRequired || !!formData.employmentStatus;

    const allValid = baseValid && ageValid && majorValid && gradValid && householdValid && employmentValid;

    if (mode === 'single') {
      return allValid && formData.city;
    }
    return allValid;
  };

  // 提交处理
  const handleSubmit = async () => {
    if (!isFormValid()) return;

    // 确保一级学科已解析
    let resolved = { ...formData };
    if (formData.major && !formData.majorFirstLevelDiscipline) {
      const flat = getCachedFlatMajors();
      const found = flat.find((m) => m.name === formData.major);
      if (found) {
        resolved.majorFirstLevelDiscipline = found.first_level_discipline;
        setFormData((prev) => ({ ...prev, majorFirstLevelDiscipline: found.first_level_discipline }));
      }
    }

    saveFormCache(resolved);
    setProfile(resolved);
    setLoading(true);

    try {
      let userProfile = resolved as UserProfile;

      if (mode === 'compare') {
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
          companyType: '重点单位',
          firstShenzhenEmploymentDate: new Date().toISOString().split('T')[0],
          returneeStatus: isOverseas ? 'within_2_years' : undefined,
        };

        const cities: CityCode[] = [
          'beijing', 'shanghai', 'shenzhen', 'guangzhou', 'hefei', 'hangzhou', 'jiaxing',
          'nanjing', 'chongqing', 'quanzhou', 'wuhan', 'wenzhou', 'ningbo', 'changsha',
          'chengdu', 'jinan', 'shaoxing', 'zhuhai', 'nanning', 'zhengzhou', 'qingdao',
          'wuxi', 'fuzhou', 'xiamen', 'nanchang', 'kunming', 'tianjin', 'suzhou', 'xian',
          'dongguan', 'foshan', 'huizhou', 'zhongshan', 'haikou', 'sanya', 'guiyang', 'shenyang',
          'dalian', 'changchun', 'harbin', 'shijiazhuang', 'yantai', 'nantong', 'changzhou',
          'xuzhou', 'tangshan', 'wuhu', 'taiyuan', 'lanzhou', 'luoyang', 'weifang', 'ganzhou',
          'yinchuan', 'huhehaote', 'linyi', 'jinhua', 'taizhou', 'baoding', 'yancheng',
          'yangzhou', 'taizhoujs', 'zhenjiang', 'lianyungang', 'huaian', 'suqian',
          'wulumuqi', 'xining', 'lasa', 'zibo', 'mianyang', 'guilin',
          'sanya', 'shantou', 'zhanjiang', 'jiujiang', 'yichang', 'xiangyang',
          'zhuzhou', 'yueyang', 'bengbu', 'maanshan', 'zhangzhou',
          'huainan', 'huaibei', 'tongling', 'anqing', 'huangshan', 'chuzhou', 'fuyang',
          'suzhouah', 'liuan', 'bozhou', 'chizhou', 'xuancheng',
          'jingzhou', 'jingmen', 'ezhou', 'huanggang',
        ];
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

  // 进度计算
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
  const citySelected = mode === 'compare' || !!formData.city;

  return (
    <div className="min-h-screen bg-paper">
      <InputHeader
        mode={mode}
        isFromCompare={isFromCompare}
        city={formData.city}
        completedSteps={completedSteps}
        totalSteps={progress.length}
        onReset={() => setShowResetConfirm(true)}
        onBack={() => {
          if (isFromCompare && formData.city) {
            navigate(`/compare?city=${formData.city}`);
          } else {
            navigate('/');
          }
        }}
      />

      <main className="mx-auto max-w-2xl px-5 py-6 sm:px-6 sm:py-10">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {mode === 'compare' ? '城市补贴对比' : '查询可申领补贴'}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {mode === 'compare'
              ? '输入你的信息，一键对比多城市补贴总额'
              : '输入你的信息，智能匹配可申领的补贴'}
          </p>
        </div>

        <div className="mt-8 space-y-6 sm:mt-10 sm:space-y-8">
          {/* 城市选择 */}
          {mode === 'single' && (
            <CitySelector
              value={formData.city}
              onChange={(city) => setFormData((prev) => ({ ...prev, city }))}
              onClear={() => setFormData((prev) => ({ ...prev, city: undefined }))}
            />
          )}

          {/* 未选城市时的引导提示 */}
          {!citySelected && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-5 py-8 text-center sm:px-6 sm:py-10">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="mt-4 text-base font-semibold text-slate-700">请先选择目标城市</p>
              <p className="mt-1 text-sm text-slate-500">选择后将展开问卷填写</p>
            </div>
          )}

          {/* 选城市后展开的问卷 */}
          {citySelected && (
            <>
              {/* 对比模式假设说明 */}
              {mode === 'compare' && (
                <div className="rounded-xl border border-civic-blue/15 bg-civic-blue/5 px-4 py-3 text-xs leading-relaxed text-civic-blue">
                  <span className="font-semibold">对比模式说明：</span>
                  系统假设你到达目标城市后会自然满足落户、就业等软性条件，因此对比结果展示的是各城市的"潜力上限"。实际申领还需满足对应条件。
                </div>
              )}

              {/* 目标区域 */}
              {mode === 'single' && (
                <DistrictSelector
                  city={formData.city}
                  value={formData.district}
                  onChange={(district) => setFormData((prev) => ({ ...prev, district }))}
                />
              )}

              {/* 学校 */}
              <SchoolSelector
                value={formData.school || ''}
                schoolLevel={formData.schoolLevel || []}
                onChange={handleSchoolSelect}
                showSchoolLevel={activeConditions.schoolLevel}
              />

              {/* 学历 */}
              <DegreeSelector
                value={formData.degree}
                city={formData.city}
                isFullTime={formData.isFullTime}
                hasDoubleDegree={formData.hasDoubleDegree}
                showFullTime={activeConditions.showFullTime !== false}
                onChange={(degree) => {
                  setFormData((prev) => ({ ...prev, degree: degree as UserProfile['degree'] }));
                  clearFieldError('degree');
                }}
                onFullTimeChange={(v) => setFormData((prev) => ({ ...prev, isFullTime: v }))}
                onDoubleDegreeChange={(v) => setFormData((prev) => ({ ...prev, hasDoubleDegree: v }))}
                error={fieldErrors.degree}
                onBlur={() => handleBlur('degree', formData.degree)}
              />

              {/* 专业 */}
              {activeConditions.major && (
                <MajorSelector
                  value={formData.major || ''}
                  city={formData.city}
                  degree={formData.degree}
                  school={formData.school}
                  majorFirstLevelDiscipline={formData.majorFirstLevelDiscipline}
                  majorInShenzhenKeyIndustry={formData.majorInShenzhenKeyIndustry}
                  keyIndustryMatchSource={keyIndustryMatchSource}
                  keyIndustryMatchedDiscipline={keyIndustryMatchedDiscipline}
                  doubleFirstClassMatch={doubleFirstClassMatch}
                  onChange={handleMajorSelect}
                  onKeyIndustryChange={(matchSource, matchedDiscipline) => {
                    setKeyIndustryMatchSource(matchSource);
                    setKeyIndustryMatchedDiscipline(matchedDiscipline);
                  }}
                  onDoubleFirstClassChange={setDoubleFirstClassMatch}
                />
              )}

              {/* 城市专属字段 */}
              <CitySpecialFields
                city={formData.city}
                district={formData.district}
                mode={mode}
                formData={formData}
                setFormData={setFormData}
                activeConditions={activeConditions}
                topStudentBases={topStudentBases}
              />

              {/* 个人情况 */}
              <PersonalInfoSection
                age={formData.age}
                graduationYear={formData.graduationYear}
                showAge={activeConditions.ageLimit}
                showGraduationYear={activeConditions.graduationYear}
                fieldErrors={fieldErrors}
                onAgeChange={(age) => setFormData((prev) => ({ ...prev, age }))}
                onGraduationYearChange={(year) => setFormData((prev) => ({ ...prev, graduationYear: year }))}
                onBlur={handleBlur}
                clearFieldError={clearFieldError}
              />

              {/* 当前状态 */}
              <StatusSection
                city={formData.city}
                employmentStatus={formData.employmentStatus}
                householdStatus={formData.householdStatus}
                firstShenzhenEmploymentDate={formData.firstShenzhenEmploymentDate}
                showHousehold={activeConditions.householdRequired}
                showEmployment={activeConditions.employmentRequired}
                onHouseholdChange={(status) => setFormData((prev) => ({ ...prev, householdStatus: status }))}
                onEmploymentChange={(status) => setFormData((prev) => ({ ...prev, employmentStatus: status }))}
                onFirstShenzhenEmploymentChange={(date) => setFormData((prev) => ({ ...prev, firstShenzhenEmploymentDate: date }))}
              />

              {/* 提交按钮 */}
              <button
                onClick={handleSubmit}
                disabled={!isFormValid() || isLoading}
                className={`mt-6 w-full rounded-2xl py-4 text-base font-bold transition-all ${
                  isFormValid() && !isLoading
                    ? 'bg-civic-blue text-white shadow-lg shadow-civic-blue/20 hover:bg-civic-blue/90 hover:shadow-xl hover:shadow-civic-blue/30'
                    : 'cursor-not-allowed bg-slate-200 text-slate-400'
                }`}
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <RadarSpinner />
                    {mode === 'compare' ? '正在核对 64 城政策…' : '正在匹配政策…'}
                  </span>
                ) : (
                  mode === 'compare' ? '开始对比' : '开始匹配'
                )}
              </button>

              {/* 匹配错误提示 */}
              {matchError && (
                <div className="mt-4 rounded-xl border border-seal-red/15 bg-seal-red/5 px-4 py-3 text-sm text-seal-red">
                  匹配出错：{matchError}，请检查信息后重试。
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* 重新开始确认弹窗 */}
      {showResetConfirm && (
        <>
          <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
          <div className="fixed left-1/2 top-1/2 z-[101] w-[min(90vw,400px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-ink">确认重新开始？</h3>
            <p className="mt-2 text-sm text-slate-500">当前已填写的所有信息将被清空，无法恢复。</p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-paper"
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
    </div>
  );
}
