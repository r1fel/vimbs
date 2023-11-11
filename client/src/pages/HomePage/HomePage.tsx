import {useState} from 'react';
import RenderCounter from '../../util/RenderCounter';
import './HomePage.scss';
import Button from '../../components/Button/Button';
import ItemList from '../../components/ItemList/ItemList';
import LoginForm from '../../components/LoginForm';
import NoAuthRedirect from '../../components/NoAuthRedirect';
import NavBar from '../../components/NavBar/NavBar';
import SearchBar from '../../components/SearchBar/SearchBar';

function HomePage(): JSX.Element {
  // NoAuthRedirect();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExecuted, setIsSearchExecuted] = useState(false);

  RenderCounter('HomePage');
  return (
    <div>
      <NavBar />
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isSearchExecuted={isSearchExecuted}
        setIsSearchExecuted={setIsSearchExecuted}
      />
      Home Page
      <LoginForm />
      <ItemList
        url={
          searchTerm != '' && isSearchExecuted
            ? `/item/search?q="${searchTerm}"`
            : 'item/'
        }
      />
    </div>
  );
}

export default HomePage;
