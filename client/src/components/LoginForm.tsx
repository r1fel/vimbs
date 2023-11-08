/* eslint-disable @typescript-eslint/no-explicit-any */
import {useState, useContext} from 'react';
import UserContext from '../context/UserContext';
import {IoEyeOffOutline, IoEye} from 'react-icons/io5';
import {handleLogin} from '../services/AuthServices';
import {logger} from '../util/logger';
import {useNavigate} from 'react-router-dom';
import Button from './Button/Button';

interface LoginFormData {
  username: string;
  password: string;
}

function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  const {setUserData, setIsLoggedIn}: any = useContext(UserContext);
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
        formData.username,
        formData.password,
      );
      logger.log('the userDataResponse in handleSubmit is:', userDataResponse);

      if (userDataResponse && userDataResponse.data) {
        await setUserData(userDataResponse.data);
        await setIsLoggedIn(true);
        await setFormData({username: '', password: ''});
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
      const userDataResponse = await handleLogin('bob', 'bob');
      logger.log('the userDataResponse in handleSubmit is:', userDataResponse);

      if (userDataResponse && userDataResponse.data) {
        await setUserData(userDataResponse.data);
        await setIsLoggedIn(true);
        await setFormData({username: '', password: ''});
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
