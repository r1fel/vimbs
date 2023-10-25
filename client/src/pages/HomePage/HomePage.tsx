import Button from '../../components/Button/Button';
import LoginForm from '../../components/LoginForm';
import {checkAuthStatus} from '../../services/AuthServices';
import './HomePage.scss';

function HomePage(): JSX.Element {
  const authStatus = checkAuthStatus();

  if (authStatus === false) {
    return null;
  }

  return (
    <div>
      Home Page
      <LoginForm />
      <Button>This is a button</Button>
      <div className="test">hello</div>
    </div>
  );
}

export default HomePage;
