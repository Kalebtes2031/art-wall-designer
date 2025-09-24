// src/utils/storage.ts

const STORAGE_KEY = "placedPositions";

export const savePlacedToStorage = (placed: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(placed));
  } catch (err) {
    console.error("❌ Failed to save placed items to localStorage:", err);
  }
};

export const loadPlacedFromStorage = (): any[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("❌ Failed to load placed items from localStorage:", err);
    return [];
  }
};

export const clearPlacedStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("❌ Failed to clear placed items from localStorage:", err);
  }
};
