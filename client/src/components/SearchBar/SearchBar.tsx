import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import './SearchBar.scss';
import { searchItems } from '../../services/ItemServices';
import Button from '../Button/Button';
import { logger } from '../../util/logger';
import debounce from '../../util/debounce';
import { SearchBarProps } from './SearchBarTypes';

function SearchBar({
  pageSearchTerm,
  setPageSearchTerm,
  isSearchExecuted,
  setIsSearchExecuted,
  setFetchMode,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [placeholder, setPlaceholder] = useState<string>('Was suchst du?');
  const navigate = useNavigate();

  // only enabled when there is a searchterm
  const searchQuery = useQuery({
    queryKey: ['item', 'search'],
    queryFn: () => searchItems(searchTerm),
    enabled: !!searchTerm,
  });

  useEffect(() => {
    // Trigger a refetch when searchTerm changes
    const debouncedRefetch = debounce(searchQuery.refetch, 200);
    debouncedRefetch();
    return () => clearTimeout(debouncedRefetch);
  }, [searchTerm]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setActiveIndex(-1);
  };

  const handleSuggestionClick = (suggestion) => {
    logger.log('suggestion:', suggestion);
    navigate(`item/${suggestion._id}`);
  };

  const handleKeyDown = (e) => {
    console.log('the active index of suggestions was: ', activeIndex);
    if (e.key === 'ArrowDown') {
      setActiveIndex((prev) =>
        Math.min(prev + 1, searchQuery.data.data.length - 1),
      );
    } else if (e.key === 'ArrowUp') {
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      handleSuggestionClick(searchQuery.data.data[activeIndex]);
    }
  };
  const handleSearchSubmit = async () => {
    if (searchTerm) {
      await setFetchMode('searchItems');
      await setPageSearchTerm(searchTerm);
      await setIsSearchExecuted(!isSearchExecuted);
      logger.log('pageSearchTerm is', pageSearchTerm);

      await setPlaceholder('Was suchst du?');
      // await setSearchTerm('');
    } else {
      setPlaceholder('Please enter something to search for...');
    }
  };

  const handleEnterPress = (e) => {
    if (e.key === 'Enter') {
      console.log('handle enterPress triggered');
      handleSearchSubmit();
    }
  };

  return (
    <form onSubmit={handleSearchSubmit}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          handleKeyDown(e);
          handleEnterPress(e);
        }}
      />
      <Button type="submit">Search!</Button>
      {searchQuery.status === 'success' &&
        searchQuery.data.data.length > 0 &&
        searchTerm && (
          <ul className="search-bar-suggestion-list">
            {searchQuery.data.data.map((suggestion, index) => (
              <Link
                id={suggestion._id}
                to={`/item/${suggestion._id}`}
                key={`${suggestion._id}-search-suggestion`}
              >
                <li
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`suggestion-item ${
                    index === activeIndex ? 'suggestion-item--focus' : null
                  }`}
                >
                  <span className="font-semibold">{suggestion.name}</span>
                </li>
              </Link>
            ))}
          </ul>
        )}
    </form>
  );
}

export default SearchBar;
