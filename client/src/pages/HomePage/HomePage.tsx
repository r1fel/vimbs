import {useState} from 'react';
import {fetchItems, searchItems} from '../../services/ItemServices';
import RenderCounter from '../../util/RenderCounter';
import './HomePage.scss';
import Button from '../../components/Button/Button';
import ItemList from '../../components/ItemList/ItemList';
import LoginForm from '../../features/authentication/components/LoginForm';
import NoAuthRedirect from '../../features/authentication/components/NoAuthRedirect';
import NavBar from '../../components/NavBar/NavBar';
import SearchBar from '../../components/SearchBar/SearchBar';
import {logger} from '../../util/logger';

function HomePage(): JSX.Element {
  // NoAuthRedirect();

  const [pageSearchTerm, setPageSearchTerm] = useState('');
  const [isSearchExecuted, setIsSearchExecuted] = useState(false);
  const [fetchMode, setFetchMode] = useState('fetchItems');

  RenderCounter('HomePage');
  logger.log(
    'pageSearchTerm is:',
    pageSearchTerm,
    'isSearchExecuted',
    isSearchExecuted,
  );
  return (
    <div>
      <NavBar />
      <SearchBar
        pageSearchTerm={pageSearchTerm}
        setPageSearchTerm={setPageSearchTerm}
        isSearchExecuted={isSearchExecuted}
        setIsSearchExecuted={setIsSearchExecuted}
        setFetchMode={setFetchMode}
      />
      Home Page
      <LoginForm />
      <ItemList
        trigger={isSearchExecuted}
        setTrigger={setIsSearchExecuted}
        fetchFunction={fetchMode === 'searchItems' ? searchItems : fetchItems}
        url={
          pageSearchTerm.length > 0 && fetchMode === 'searchItems'
            ? `${pageSearchTerm}`
            : 'item/'
        }
      />
    </div>
  );
}

export default HomePage;
