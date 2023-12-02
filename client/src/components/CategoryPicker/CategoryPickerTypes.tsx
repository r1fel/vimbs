export interface CategoryPickerProps {
  setConfirmedTopCategory: (category: string | null) => void;
  setConfirmedSubCategory: (subCategory: string | null) => void;
  setIsCategoryModalOpen: (isOpen: boolean) => void;
}

export interface TopCategories {
  [key: string]: string;
}

export interface SubCategories {
  [key: string]: string[];
}
