export interface ItemCardProps {
  itemId: string;
  itemName: string;
  itemDescription: string;
  itemImages: string;
  itemAvailable: boolean;
  itemOwner: boolean;
  itemCategories: { [key: string]: string };
}
