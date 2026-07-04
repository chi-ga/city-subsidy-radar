import type { UserProfile } from '../../../types';
import type { TopStudentPlanBase } from '../../../data/lazyTalent';
import { isOverseasSchool } from '../../../data/lazyTalent';

// 深圳组件
import { TopStudentPlanField } from '../shenzhen/TopStudentPlanField';
import { STEMField } from '../shenzhen/STEMField';
import { InnovationAbilityField } from '../shenzhen/InnovationAbilityField';
import { InnovationContributionField } from '../shenzhen/InnovationContributionField';

// 北京组件
import { ThreeCitiesOneDistrictField } from '../beijing/ThreeCitiesOneDistrictField';

// 上海组件
import { ReturneeStatusField } from '../shanghai/ReturneeStatusField';
import { LingangEmploymentField } from '../shanghai/LingangEmploymentField';

// 广州组件
import { FirstHukouField } from '../guangzhou/FirstHukouField';
import { HuaduImportStatusField } from '../guangzhou/HuaduImportStatusField';

// 合肥组件
import { CompanyTypeField } from '../hefei/CompanyTypeField';

// 通用组件
import { IdentityTypeField } from './IdentityTypeField';
import { Tier2QuestionsSection } from './Tier2QuestionsSection';

interface CitySpecialFieldsProps {
  city?: string;
  district?: string;
  mode: string;
  formData: Partial<UserProfile>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<UserProfile>>>;
  activeConditions: Record<string, any>;
  topStudentBases: TopStudentPlanBase[];
}

/**
 * 城市专属字段容器
 * 根据当前城市和区域，渲染对应的城市专属字段组件
 *
 * 扩展新城市字段的步骤：
 * 1. 在对应城市文件夹下创建新组件
 * 2. 在本组件中添加条件渲染
 * 3. 在 city-conditions.json 中添加 showXxx 配置
 */
export function CitySpecialFields({
  city,
  district,
  mode,
  formData,
  setFormData,
  activeConditions,
  topStudentBases,
}: CitySpecialFieldsProps) {
  return (
    <>
      {/* 深圳：拔尖计划基地 */}
      {(mode === 'compare' || city === 'shenzhen') && topStudentBases.length > 0 && (
        <TopStudentPlanField
          bases={topStudentBases}
          school={formData.school || ''}
          value={formData.topStudentPlanBase}
          inTopStudentPlan={formData.inTopStudentPlan}
          onChange={(baseName, inPlan) =>
            setFormData((prev) => ({
              ...prev,
              topStudentPlanBase: baseName,
              inTopStudentPlan: inPlan,
            }))
          }
        />
      )}

      {/* 深圳：STEM 判断（境外高校即显示） */}
      {mode === 'single' &&
        city === 'shenzhen' &&
        formData.school &&
        isOverseasSchool(formData.school) && (
          <STEMField
            value={formData.isStemMajor}
            onChange={(v) => setFormData((prev) => ({ ...prev, isStemMajor: v }))}
          />
        )}

      {/* 深圳：创新能力类 */}
      {mode === 'single' && city === 'shenzhen' && (
        <InnovationAbilityField
          value={formData.hasInnovationAbility}
          onChange={(v) => setFormData((prev) => ({ ...prev, hasInnovationAbility: v }))}
        />
      )}

      {/* 深圳：创新贡献类 */}
      {mode === 'single' && city === 'shenzhen' && (
        <InnovationContributionField
          value={formData.hasInnovationContribution}
          onChange={(v) => setFormData((prev) => ({ ...prev, hasInnovationContribution: v }))}
        />
      )}

      {/* 身份类型（港澳台/外籍筛选） */}
      {activeConditions.showIdentityType && (
        <IdentityTypeField
          value={formData.identityType}
          onChange={(v) => setFormData((prev) => ({ ...prev, identityType: v }))}
        />
      )}

      {/* 北京：三城一区 */}
      {activeConditions.showThreeCitiesOneDistrict && city === 'beijing' && (
        <ThreeCitiesOneDistrictField
          value={formData.isInThreeCitiesOneDistrict}
          onChange={(v) => setFormData((prev) => ({ ...prev, isInThreeCitiesOneDistrict: v }))}
        />
      )}

      {/* 上海：留学回国时间（仅境外高校显示） */}
      {activeConditions.showReturneeStatus &&
        city === 'shanghai' &&
        formData.school &&
        isOverseasSchool(formData.school) && (
          <ReturneeStatusField
            value={formData.returneeStatus}
            onChange={(v) => setFormData((prev) => ({ ...prev, returneeStatus: v }))}
          />
        )}

      {/* 上海临港：首次在临港就业 */}
      {activeConditions.showFirstLingangEmployment &&
        city === 'shanghai' &&
        district === '浦东新区' && (
          <LingangEmploymentField
            value={formData.isFirstLingangEmployment}
            onChange={(v) => setFormData((prev) => ({ ...prev, isFirstLingangEmployment: v }))}
          />
        )}

      {/* 广州黄埔：首次入户广州 */}
      {activeConditions.showFirstGuangzhouHukou &&
        city === 'guangzhou' &&
        district === '黄埔区' && (
          <FirstHukouField
            value={formData.isFirstGuangzhouHukou}
            onChange={(v) => setFormData((prev) => ({ ...prev, isFirstGuangzhouHukou: v }))}
          />
        )}

      {/* 广州花都：引进时间状态 */}
      {activeConditions.showHuaduImportStatus &&
        city === 'guangzhou' &&
        district === '花都区' && (
          <HuaduImportStatusField
            value={formData.huaduImportStatus}
            onChange={(v) => setFormData((prev) => ({ ...prev, huaduImportStatus: v }))}
          />
        )}

      {/* 用人单位类型（合肥/南京等） */}
      {activeConditions.showCompanyType && (
        <CompanyTypeField
          city={city}
          value={formData.companyType}
          onChange={(v) => setFormData((prev) => ({ ...prev, companyType: v }))}
        />
      )}

      {/* Tier 2 追问区域：细分追问层（可折叠） */}
      {mode === 'single' && (
        <Tier2QuestionsSection
          city={city}
          formData={formData}
          setFormData={setFormData}
        />
      )}
    </>
  );
}
