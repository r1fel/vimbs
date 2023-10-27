import {useEffect} from 'react';
import RenderCounter from '../../util/renderCounter';
import Button from '../../components/Button/Button';
import LoginForm from '../../components/LoginForm';
import './HomePage.scss';
import NoAuthRedirect from '../../components/NoAuthRedirect';
import ItemList from '../../components/List/ItemList';
import {fetchItems} from '../../services/ItemServices';

function HomePage(): JSX.Element {
  //! I want to use "useEffect", but it gives error, why?
  // NoAuthRedirect();
  // fetchItems('books/');
  RenderCounter('HomePage');
  return (
    <div>
      Home Page
      <LoginForm />
      <ItemList url={'books/'} />
      {/* <Button>This is a button</Button> */}
    </div>
  );
}

export default HomePage;
