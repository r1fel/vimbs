import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SearchBar.scss';


function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

function SearchBar() {
  const [searchTerm, setsearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchSuggestions, setSearchSuggestions] = useState([]);


  const handleSearchTermChange = async (searchTerm) => {
    try {
     
      const restaurantNames = response.data.map((item, index) => ({
        key: index,
        name: item.name,
        reference: item.reference,
        _id: item._id,
      }));
      setSearchSuggestions(restaurantNames);
      console.log(searchSuggestions);
    } catch (error) {
      console.error('RestList error:', error);
    }
  };


  const handleChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term)

  const handleSubmit = (e) => {
    e.preventDefault()
    //make request to backend
  }

  return (
<form onSubmit={handleSubmit}>
  <input onChange={handleChange} >
  </input>

</form>

  );
}

export default SearchBar;
