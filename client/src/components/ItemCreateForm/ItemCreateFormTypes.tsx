export interface ItemCreateFormDataProps {
  name: string;
  description: string;
  picture: string;
  categories: {
    HouseAndGarden?: {
      subcategories: [string];
    };
    ChildAndBaby?: {
      subcategories: [string];
    };
    MediaAndGames?: {
      subcategories: [string];
    };
    AdultClothing?: {
      subcategories: [string];
    };
    SportAndCamping?: {
      subcategories: [string];
    };
    Technology?: {
      subcategories: [string];
    };
    Other?: {
      subcategories: [string];
    };
  };
}
