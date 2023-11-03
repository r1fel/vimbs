import RenderCounter from '../../util/RenderCounter';
import './HomePage.scss';
import Button from '../../components/Button/Button';
import ItemList from '../../components/ItemList/ItemList';
import LoginForm from '../../components/LoginForm';
import NoAuthRedirect from '../../components/NoAuthRedirect';
import NavBar from '../../components/NavBar/NavBar';

function HomePage(): JSX.Element {
  //! I want to use "useEffect", but it gives error, why?
  // NoAuthRedirect();

  RenderCounter('HomePage');
  return (
    <div>
      <NavBar />
      Home Page
      <LoginForm />
      <ItemList url={'item/'} />
      <Button>This is a button</Button>
    </div>
  );
}

export default HomePage;
