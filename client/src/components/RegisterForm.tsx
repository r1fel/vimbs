import {useState, useContext} from 'react';
import UserContext from '../context/UserContext';
import {IoEyeOffOutline, IoEye} from 'react-icons/io5';
import {handleRegister} from '../services/AuthServices';
import {logger} from '../util/logger';

function RegisterForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

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

  const handleSubmit = (e: any) => {
    e.preventDefault();
    handleRegister(formData.username, formData.email, formData.password);
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
          Register
        </button>
      </form>
    </div>
  );
}

export default RegisterForm;
