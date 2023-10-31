import {useEffect} from 'react';
import {fetchItems} from '../../services/ItemServices';
import RenderCounter from '../../util/renderCounter';
import './HomePage.scss';
import Button from '../../components/Button/Button';
import ItemList from '../../components/ItemList/ItemList';
import LoginForm from '../../components/LoginForm';
import NoAuthRedirect from '../../components/NoAuthRedirect';

function HomePage(): JSX.Element {
  //! I want to use "useEffect", but it gives error, why?
  // NoAuthRedirect();

  RenderCounter('HomePage');
  return (
    <div>
      Home Page
      <LoginForm />
      <ItemList url={'books/'} />
      <Button>This is a button</Button>
    </div>
  );
}

export default HomePage;
