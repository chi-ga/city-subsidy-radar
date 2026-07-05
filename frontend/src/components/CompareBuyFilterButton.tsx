import { useResultStore } from '../stores';
import { BuyFilterButton } from './BuyFilterButton';

export function CompareBuyFilterButton() {
  const { compareExcludedCategories, toggleCompareExcludedCategory } = useResultStore();
  const isFiltered = compareExcludedCategories.includes('buy');

  return (
    <BuyFilterButton
      isFiltered={isFiltered}
      onToggle={() => toggleCompareExcludedCategory('buy')}
    />
  );
}
