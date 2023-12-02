export interface Item {
  picture: string;
  name: string;
  description: string;
  categories: {
    [key: string]: {
      subcategories: string[];
    };
  };
}
