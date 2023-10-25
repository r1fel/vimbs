import {useState} from 'React';
import './SearchBar.scss';

function SearchBar() {
  const [searchTerm, setsearchTerm] = useState('');


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
