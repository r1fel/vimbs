import {useState} from 'react';
// import UserContext from '../context/UserContext';
import {handleLogin} from '../services/AuthServices';

function LoginForm() {
  // const {isLoggedIn, setIsLoggedIn} = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({username: '', password: ''});

  const togglePasswordVisibility = setShowPassword(!showPassword);

  const handleChange = (e) => {
    const changedField = e.target.name;
    const newValue = e.target.value;
    console.log('the login form value is: ', formData);
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
        <p>
          <label>Username </label>
          <input
            type="text"
            placeholder="Username"
            className="input"
            value={formData.username}
            onChange={handleChange}
            name="username"
            id="username"
          />
        </p>
        <p>
          <label>Password </label>
          <input
            type="password"
            placeholder="Password"
            className="input"
            value={formData.password}
            onChange={handleChange}
            name="password"
            id="password"
          />
        </p>
        <button onClick={handleSubmit} className="button">
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
