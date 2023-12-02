/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { IoEyeOffOutline, IoEye } from 'react-icons/io5';
import { handleLogin } from '../services/AuthServices';
import { logger } from '../../../util/logger';
import { userDataAtom } from '../../../context/userAtoms';
import Button from '../../../components/Button/Button';
import NoAuthRedirect from './NoAuthRedirect';

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
  const [showPassword, setShowPassword] = useState(false);

  logger.log('userData from atom is:', userData);

  const navigate = useNavigate();
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  NoAuthRedirect();

  //load to invalidate all related data (e.g. itemList) exact: true makes sure not every query that starts with 'items' gets invalidated
  const queryClient = useQueryClient();
  //use createItem as mutation function
  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: handleLogin,
    onSuccess: async (data) => {
      await setUserData(data.data);
      logger.log('loginQueryData is:', data.data);
      await setFormData({ email: '', password: '' });
      queryClient.invalidateQueries(['item'], { exact: true });
      queryClient.invalidateQueries(['auth'], { exact: true });
      navigate('/');
    },
    onError: (error) => logger.log('Login Mutation Did not happen', error),
  });

  const handleChange = (e: any) => {
    const changedField = e.target.name;
    const newValue = e.target.value;
    logger.log('the login form value is: ', formData);
    setFormData((currData) => {
      currData[changedField] = newValue;
      return { ...currData };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const handleSubmitBob = (e) => {
    e.preventDefault();
    loginMutation.mutate({ email: 'bob@gmail.com', password: 'bob' });
  };

  return (
    <div>
      <h2>Login</h2>
      <form>
        <div>
          <label htmlFor="email">Email </label>
          <input
            type="text"
            placeholder="Email"
            className="input"
            value={formData.email}
            onChange={handleChange}
            name="email"
            id="email"
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
