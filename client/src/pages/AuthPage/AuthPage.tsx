import {useState} from 'react';
import LoginForm from '../../features/authentication/components/LoginForm';
import RegisterForm from '../../features/authentication/components/RegisterForm';
import Button from '../../components/Button/Button';

function AuthPage(): JSX.Element {
  const [loginOrRegister, setLoginOrRegister] = useState('login');

  const toggle = () => {
    loginOrRegister === 'login'
      ? setLoginOrRegister('register')
      : setLoginOrRegister('login');
  };

  return (
    <div>
      {loginOrRegister === 'login' ? <LoginForm /> : <RegisterForm />}
      <p>
        {loginOrRegister === 'login'
          ? 'Need an account?'
          : 'Already have an account?'}
        <Button onClick={toggle}>
          {loginOrRegister === 'login' ? 'Register' : 'Login'}
        </Button>
      </p>
    </div>
  );
}

export default AuthPage;
