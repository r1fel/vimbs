import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import './SearchBar.scss';
import {searchItems} from '../../services/ItemServices';
import catchAsync from '../../util/catchAsync';

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

function SearchBar({searchTerm, setSearchTerm}) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [placeholder, setPlaceholer] = useState('Was suchst du?');

  const handleSearchTermChange = catchAsync(async (searchTerm: string) => {
    const suggestedItems = await searchItems(searchTerm);
    const items = suggestedItems.data.map((item) => ({
      key: `search-result-${item._id}`,
      name: item.name,
      id: item._id,
    }));
    await setSearchSuggestions(items);
    console.log('search suggestions are:', searchSuggestions);
  });

  useEffect(() => {
    const debouncedSearch = debounce(handleSearchTermChange, 300);
    if (searchTerm) {
      debouncedSearch(searchTerm);
    }
  }, [searchTerm]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setActiveIndex(-1);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.name);
  };

  const handleKeyDown = (e) => {
    console.log('the active index of suggestions was: ', activeIndex);
    if (e.key === 'ArrowDown') {
      setActiveIndex((prev) =>
        Math.min(prev + 1, searchSuggestions.length - 1),
      );
    } else if (e.key === 'ArrowUp') {
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      handleSuggestionClick(searchSuggestions[activeIndex]);
    }
  };
  const handleSearchClick = () => {
    if (searchTerm) {
    } else {
      setPlaceholder('Please enter something to search for...');
    }
  };

  const handleEnterPress = (e) => {
    if (e.key === 'Enter') {
      console.log('handle enterPress triggered');
      handleSearchClick();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //make request to backend
  };

  return (
    <form onSubmit={handleSubmit}>
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
      {searchSuggestions.length > 0 && searchTerm && (
        <ul className="search-bar-suggestion-list">
          {searchSuggestions.map((suggestion, index) => (
            <Link
              to={`/rest/${suggestion._id}`}
              key={`${suggestion._id}-search-suggestion`}
            >
              <li
                onClick={() => handleSuggestionClick(suggestion)}
                className={`suggestion-item ${
                  index === activeIndex ? 'background-grey' : ''
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
