import { CheckboxField } from '../shared/CheckboxField';
import { SelectField } from '../shared/SelectField';

interface CompanyTypeFieldProps {
  city?: string;
  value?: string;
  onChange: (value: string | undefined) => void;
}

const COMPANY_TYPE_OPTIONS = [
  { value: '规模以上工业企业', label: '规模以上工业企业' },
  { value: '国家高新技术企业', label: '国家高新技术企业' },
  { value: '省级以上专精特新企业', label: '省级以上专精特新企业' },
  { value: '重大创新平台', label: '重大创新平台' },
  { value: '高水平新型研发机构', label: '高水平新型研发机构' },
  { value: '独角兽企业', label: '独角兽企业' },
  { value: '培育独角兽企业', label: '培育独角兽企业' },
  { value: '瞪羚企业', label: '瞪羚企业' },
  { value: '区级以上重点人才工程入选者创办企业', label: '区级以上重点人才工程入选者创办企业' },
  { value: '其他', label: '其他（不属于以上类型）' },
];

/**
 * 用人单位类型字段
 * 合肥：复选框 + 查询链接
 * 其他城市：下拉选择
 */
export function CompanyTypeField({ city, value, onChange }: CompanyTypeFieldProps) {
  if (city === 'hefei') {
    return (
      <section className="animate-fade-slide-in">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          企业是否属于重点单位
        </label>
        <p className="mt-1 text-xs text-slate-400">
          合肥人才补贴要求所在企业属于政策规定的产业及相关领域重点单位
        </p>
        <div className="mt-3">
          <CheckboxField
            checked={value === '重点单位'}
            onChange={(checked) => onChange(checked ? '重点单位' : undefined)}
            label="是，所在企业属于重点单位"
          />
          <a
            href="http://rcaj.hfrsggff.com:8088/talent/#/enterpriseDirectory"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-civic-blue hover:underline"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            点击查询企业是否在重点单位名录
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="animate-fade-slide-in">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        用人单位类型
        <span className="ml-1 text-xs font-normal text-slate-400">（部分区域补贴限定企业类型）</span>
      </label>
      <p className="mt-1 text-xs text-slate-400">
        如南京雨花台区优秀高校毕业生生活补贴要求用人单位属于重点产业企业
      </p>
      <div className="mt-3">
        <SelectField
          value={value}
          onChange={onChange}
          options={COMPANY_TYPE_OPTIONS}
          placeholder="请选择用人单位类型"
        />
      </div>
    </section>
  );
}
