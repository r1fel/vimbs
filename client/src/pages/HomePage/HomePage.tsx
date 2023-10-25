import Button from '../../components/Button/Button';
import LoginForm from '../../components/LoginForm';
import './HomePage.scss';

function HomePage(): JSX.Element {
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
