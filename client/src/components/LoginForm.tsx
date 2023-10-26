import {useState} from 'react';
import {IoEyeOffOutline, IoEye} from 'react-icons/io5';
// import UserContext from '../context/UserContext';
import {handleLogin} from '../services/AuthServices';
import {logger} from '../util/logger';

function LoginForm() {
  // const {isLoggedIn, setIsLoggedIn} = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({username: '', password: ''});

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
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
    await handleLogin(formData.username, formData.password);
    setFormData({username: '', password: ''});
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
      </form>
    </div>
  );
}

export default LoginForm;
