import {useEffect} from 'react';
// import log from '../../util/Logger';
import Button from '../../components/Button/Button';
import LoginForm from '../../components/LoginForm';
import './HomePage.scss';
import NoAuthRedirect from '../../components/NoAuthRedirect';

function HomePage(): JSX.Element {
  //! I want to use "useEffect", but it gives error, why?
  // NoAuthRedirect();

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
