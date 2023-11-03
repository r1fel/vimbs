import RenderCounter from '../../util/RenderCounter';
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
      <ItemList url={'/'} />
      <Button>This is a button</Button>
    </div>
  );
}

export default HomePage;
