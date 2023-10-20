import { createContext, useState } from 'react';
import axios from 'axios';


const UserContext = createContext();

function Provider({ children }) {

  //Handle login and password validation
  const [showLogin, setShowLogin] = useState(true);

  const handleLogin = async (username, password) => {
    const response = await axios.post('http://localhost:8080/login', { username, password }, { withCredentials: true });
    setShowLogin(false);
  };

  const handleRegister = async (username, email, password) => {
    const response = await axios.post('http://localhost:8080/register', { username, email, password }, { withCredentials: true })
    setShowLogin(false);
  }

  // Logout function to set all States back to 0
  const handleLogout = async () => {
    const response = await axios.get('http://localhost:8080/logout', { withCredentials: true });
    setShowLogin(true);
  };

  const valueToShare = {
    showLogin,
    handleLogin,
    handleLogout,
    handleRegister,
  }

  return <UserContext.Provider value={valueToShare}>
    {children}
  </UserContext.Provider>

}

export { Provider };
export default UserContext;