export interface ItemListProps {
  url: string;
  fetchFunction: (url: string) => Promise<any>; // Adjust the type as needed
  trigger: string | number | boolean;
}

export interface Item {
  _id: string;
  name: string;
  description: string;
  picture: string;
  available: boolean;
  owner: boolean;
  categories: { [key: string]: string };
}
