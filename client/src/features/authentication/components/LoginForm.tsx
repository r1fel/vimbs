/* eslint-disable @typescript-eslint/no-explicit-any */
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAtom} from 'jotai';
import {IoEyeOffOutline, IoEye} from 'react-icons/io5';
import {handleLogin} from '../services/AuthServices';
import {logger} from '../../../util/logger';
import {userDataAtom, isLoggedInAtom} from '../../../context/userAtoms';
import Button from '../../../components/Button/Button';

interface LoginFormData {
  email: string;
  password: string;
}

function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [userData, setUserData] = useAtom(userDataAtom);
  const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e: any) => {
    const changedField = e.target.name;
    const newValue = e.target.value;
    logger.log('the login form value is: ', formData);
    setFormData((currData) => {
      currData[changedField] = newValue;
      return {...currData};
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // handle login in AuthServices
      const userDataResponse = await handleLogin(
        formData.email,
        formData.password,
      );
      logger.log(
        'the userDataResponse in handleSubmit is:',
        userDataResponse.data,
      );

      if (userDataResponse && userDataResponse.data) {
        await setUserData(userDataResponse.data);
        await setIsLoggedIn(true);
        await setFormData({email: '', password: ''});
        navigate('/');
      } else {
        logger.error('Login failed.');
      }
    } catch (error) {
      logger.error('login handleSubmit failed!', error);
    }
  };

  const handleSubmitBob = async (e) => {
    e.preventDefault();
    try {
      // handle login in AuthServices
      const userDataResponse = await handleLogin('bob@gmail.com', 'bob');
      logger.log('the userDataResponse in handleSubmit is:', userDataResponse);

      if (userDataResponse && userDataResponse.data) {
        await setUserData(userDataResponse.data);
        await setIsLoggedIn(true);
        await setFormData({email: '', password: ''});
        navigate('/');
      } else {
        logger.error('Login failed.');
      }
    } catch (error) {
      logger.error('login handleSubmit failed!', error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username </label>
          <input
            type="text"
            placeholder="Username"
            className="input"
            value={formData.username}
            onChange={handleChange}
            name="username"
            id="username"
          />
        </div>
        <div>
          <label htmlFor="password">Password </label>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="input"
            value={formData.password}
            onChange={handleChange}
            name="password"
            id="password"
          />
          {showPassword ? (
            <IoEye onClick={toggleShowPassword} />
          ) : (
            <IoEyeOffOutline onClick={toggleShowPassword} />
          )}
        </div>
        <button onClick={handleSubmit} className="button">
          Login
        </button>
        <Button onClick={handleSubmitBob}>Login with Bob</Button>
      </form>
    </div>
  );
}

export default LoginForm;
