import { useState } from 'react';
import { getTier2Questions } from '../../../data';
import type { UserProfile } from '../../../types';

interface Tier2QuestionsSectionProps {
  city?: string;
  formData: Partial<UserProfile>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<UserProfile>>>;
}

/**
 * Tier 2 追问区域
 * 细分追问层（可折叠），用于高层次人才或持有技能证书的用户
 */
export function Tier2QuestionsSection({
  city,
  formData,
  setFormData,
}: Tier2QuestionsSectionProps) {
  const [showQuestions, setShowQuestions] = useState(false);
  const tier2Questions = getTier2Questions(city);

  if (tier2Questions.length === 0) return null;

  return (
    <section>
      {/* 折叠触发链接 */}
      <button
        type="button"
        onClick={() => setShowQuestions(!showQuestions)}
        className="flex w-full items-center justify-center gap-1.5 py-2 text-xs text-slate-400 transition-colors hover:text-civic-blue"
      >
        如果您是高层次人才或持有技能证书，点此查看其他通道
        <svg
          className={`h-3 w-3 transition-transform ${showQuestions ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 展开的追问表单 */}
      {showQuestions && (
        <div className="mt-2 animate-fade-slide-in rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 sm:p-5">
          <p className="text-xs text-slate-500">
            如果您是高层次人才或持有技能证书，可匹配到其他补贴通道
          </p>

          <div className="mt-3 space-y-3">
            {tier2Questions.map((q) => {
              // 检查是否应该显示此问题
              const shouldShow =
                !q.showWhen ||
                (formData as Record<string, any>)[q.showWhen.field] === q.showWhen.value;

              if (!shouldShow) return null;

              return (
                <div key={q.field}>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    {q.label}
                  </label>
                  {q.description && (
                    <p className="mt-0.5 text-xs text-slate-400">{q.description}</p>
                  )}
                  <div className="mt-1.5">
                    <div className="relative">
                      <select
                        value={(formData as Record<string, any>)[q.field] || ''}
                        onChange={(e) => {
                          const value = e.target.value || undefined;
                          setFormData((prev) => ({
                            ...prev,
                            [q.field]: value,
                          }));
                        }}
                        className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition-colors focus:border-civic-blue focus:outline-none focus:ring-2 focus:ring-civic-blue/20"
                      >
                        {q.options?.map((opt: { value: string; label: string }) => (
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
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                    {q.link && (
                      <a
                        href={q.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-civic-blue hover:underline"
                      >
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        {q.link.text}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
