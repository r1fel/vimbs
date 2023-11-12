import {useState, useContext, useEffect} from 'react';
import UserContext from '../../../context/UserContext';
import {IoEyeOffOutline, IoEye} from 'react-icons/io5';
import {handleRegister} from '../services/AuthServices';
import {logger} from '../../../util/logger';
import RegisterPwdValidator from './RegisterPwdValidator';
import {useNavigate} from 'react-router-dom';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}

function RegisterForm() {
  const {setUserData, setIsLoggedIn}: any = useContext(UserContext);
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const isUsernameValid = /^[a-zA-Z0-9_-]+$/.test(formData.username); // Username should only contain letters, numbers, dashes, and underscores
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email); // Email should be a valid email address format
  const isPasswordValid = formData.password.length >= 5; // Password should be at least 5 characters long

  console.log(
    'user:',
    isUsernameValid,
    'email:',
    isEmailValid,
    'password:',
    isPasswordValid,
    'submitted:',
    formSubmitted,
  );

  const navigate = useNavigate();
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e: any) => {
    const changedField = e.target.name;
    const newValue = e.target.value;
    logger.log(newValue);
    setFormData((currData) => {
      currData[changedField] = newValue;
      return {...currData};
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (isUsernameValid && isEmailValid && isPasswordValid) {
      const user = await handleRegister(
        formData.username,
        formData.email,
        formData.password,
      );
      if (user) {
        await setIsLoggedIn(true);
        await setUserData(user.data);
        logger.log('register response', user);
        navigate('/');
      } else {
        logger.error('no user was fetched');
      }
    } else {
      setFormSubmitted(true);
      logger.log('registration could not be submitted');
    }
  };

  //Register form

  return (
    <div>
      <h3>Register Form</h3>
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
          <p className="register-form--valdiate-error">
            {formSubmitted &&
              !isUsernameValid &&
              'usernames can contain only letters, numbers, dashes and underscores'}
          </p>
        </div>
        <div>
          <label htmlFor="email">E-mail </label>
          <input
            type="text"
            placeholder="E-mail"
            className="input"
            value={formData.email}
            onChange={handleChange}
            name="email"
            id="email"
          />
          <p className="register-form--valdiate-error">
            {formSubmitted && !isEmailValid && 'please enter a valid email'}
          </p>
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
          <p className="register-form--valdiate-error">
            {formSubmitted &&
              !isPasswordValid &&
              'passwords need to be minimum 5 characters long'}
          </p>
        </div>

        <button onClick={handleSubmit} className="button">
          Register
        </button>
      </form>
    </div>
  );
}

export default RegisterForm;
