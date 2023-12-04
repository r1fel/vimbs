export interface SearchBarProps {
  pageSearchTerm: string;
  setPageSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  isSearchExecuted: boolean;
  setIsSearchExecuted: React.Dispatch<React.SetStateAction<boolean>>;
  setFetchMode: React.Dispatch<React.SetStateAction<string>>;
}
