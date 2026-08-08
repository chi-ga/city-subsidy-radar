import { useNavigate } from 'react-router-dom';
import { useHistoryStore } from '../stores';
import { CITY_NAMES } from '../constants';
import { HistoryIcon } from './icons';
import type { CityCode } from '../constants';
import type { HistoryRecord } from '../stores';

/** 获取最近一条历史记录的预览文本 */
function getLastQueryPreview(record: HistoryRecord | undefined): string | null {
  if (!record) return null;
  const { profileSnapshot: s, queryType } = record;
  const parts: string[] = [];

  if (queryType === 'single' && s.city) {
    parts.push(CITY_NAMES[s.city as CityCode] ?? s.city);
  } else if (queryType === 'compare') {
    parts.push('多城对比');
  }
  if (s.degree) parts.push(s.degree);
  if (s.school) parts.push(s.school);

  return parts.length > 0 ? parts.join('/') : null;
}

export function HistoryButton() {
  const navigate = useNavigate();
  const { records } = useHistoryStore();
  const count = records.length;
  const lastRecord = records[0];
  const preview = getLastQueryPreview(lastRecord);

  return (
    <button
      onClick={() => navigate('/history')}
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-ring"
      title={preview ? `上次查询：${preview}` : '查询历史'}
    >
      <HistoryIcon className="h-[18px] w-[18px]" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-civic-blue px-1 text-[10px] font-bold text-white ring-2 ring-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}

export { getLastQueryPreview };
