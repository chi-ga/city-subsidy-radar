import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SubsidyCategory } from '../types';

/** 收藏项的精简数据（不存完整 Subsidy 对象，减少存储体积） */
export interface FavoriteItem {
  id: string;
  city: string;
  name: string;
  category: SubsidyCategory;
  amountMin: number;
  amountMax: number;
  unit: string;
  /** 用于结果页跳转时定位 */
  location?: string;
}

interface FavoritesState {
  favorites: FavoriteItem[];
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (id: string) => boolean;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      toggleFavorite: (item) => {
        const { favorites } = get();
        const exists = favorites.some((f) => f.id === item.id);
        if (exists) {
          set({ favorites: favorites.filter((f) => f.id !== item.id) });
        } else {
          set({ favorites: [...favorites, item] });
        }
      },

      isFavorite: (id) => get().favorites.some((f) => f.id === id),

      removeFavorite: (id) => {
        set({ favorites: get().favorites.filter((f) => f.id !== id) });
      },

      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: 'subsidy-radar-favorites',
    }
  )
);
