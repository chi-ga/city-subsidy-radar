import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MatchResult } from '../types';
import type { SubsidyCategory } from '../constants';

interface ResultState {
  result: MatchResult | null;
  compareResults: Record<string, MatchResult> | null;
  compareExcludedCategories: SubsidyCategory[];
  excludedCategories: SubsidyCategory[];
  isLoading: boolean;
  error: string | null;
  setResult: (result: MatchResult) => void;
  setCompareResults: (results: Record<string, MatchResult>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleCompareExcludedCategory: (category: SubsidyCategory) => void;
  toggleExcludedCategory: (category: SubsidyCategory) => void;
  toggleTodo: (todoId: string) => void;
  reset: () => void;
}

export const useResultStore = create<ResultState>()(
  persist(
    (set, get) => ({
      result: null,
      compareResults: null,
      compareExcludedCategories: [],
      excludedCategories: [],
      isLoading: false,
      error: null,
      setResult: (result) => set({ result, isLoading: false, error: null }),
      setCompareResults: (compareResults) => set({ compareResults, isLoading: false, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      toggleCompareExcludedCategory: (category) => {
        const current = get().compareExcludedCategories;
        const next = current.includes(category)
          ? current.filter((c) => c !== category)
          : [...current, category];
        set({ compareExcludedCategories: next });
      },
      toggleExcludedCategory: (category) => {
        const current = get().excludedCategories;
        const next = current.includes(category)
          ? current.filter((c) => c !== category)
          : [...current, category];
        set({ excludedCategories: next });
      },
      toggleTodo: (todoId: string) => {
        const { result } = get();
        if (!result) return;
        set({
          result: {
            ...result,
            todoList: result.todoList.map((t) =>
              t.id === todoId ? { ...t, completed: !t.completed } : t
            ),
          },
        });
      },
      reset: () => set({ result: null, compareResults: null, compareExcludedCategories: [], excludedCategories: [], isLoading: false, error: null }),
    }),
    {
      name: 'subsidy-radar-result',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        result: state.result,
        compareResults: state.compareResults,
        compareExcludedCategories: state.compareExcludedCategories,
        excludedCategories: state.excludedCategories,
      }),
    }
  )
);
