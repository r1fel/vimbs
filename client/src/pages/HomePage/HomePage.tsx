import { useState } from 'react';
import { useAtom } from 'jotai';
import { fetchItems, searchItems } from '../../services/ItemServices';
import RenderCounter from '../../util/RenderCounter';
import './HomePage.scss';
import { userDataAtom } from '../../context/userAtoms';
import Button from '../../components/Button/Button';
import ItemList from '../../components/ItemList/ItemList';
import LoginForm from '../../features/authentication/components/LoginForm';
import NoAuthRedirect from '../../features/authentication/components/NoAuthRedirect';
import NavBar from '../../components/NavBar/NavBar';
import SearchBar from '../../components/SearchBar/SearchBar';
import { logger } from '../../util/logger';

function HomePage(): JSX.Element {
  const [pageSearchTerm, setPageSearchTerm] = useState('');
  const [isSearchExecuted, setIsSearchExecuted] = useState(false);
  const [fetchMode, setFetchMode] = useState('fetchItems');
  const [userData] = useAtom(userDataAtom);

  NoAuthRedirect();

  RenderCounter('HomePage');
  logger.log(
    'pageSearchTerm is:',
    pageSearchTerm,
    'isSearchExecuted',
    isSearchExecuted,
  );
  return (
    <div>
      {userData && (
        <div>
          <NavBar />
          <SearchBar
            pageSearchTerm={pageSearchTerm}
            setPageSearchTerm={setPageSearchTerm}
            isSearchExecuted={isSearchExecuted}
            setIsSearchExecuted={setIsSearchExecuted}
            setFetchMode={setFetchMode}
          />
          <ItemList
            trigger={isSearchExecuted}
            setTrigger={setIsSearchExecuted}
            fetchFunction={
              fetchMode === 'searchItems' ? searchItems : fetchItems
            }
            url={
              pageSearchTerm.length > 0 && fetchMode === 'searchItems'
                ? `${pageSearchTerm}`
                : 'item/'
            }
          />{' '}
        </div>
      )}
    </div>
  );
}

export default HomePage;
