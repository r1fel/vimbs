import axios from 'axios';
import log from '../util/log';

//TODO FR: How does auth process work?
export const checkAuthStatus = async () => {
  const authStatusResponse = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}/auth`,
  );
  const authStatusData = authStatusResponse.data;
  log(' - Current auth status is:', authStatusData);

  return authStatusData;
};

export const handleLogin = async (username: string, password: string) => {
  const loginResponse = await axios.post(
    `${import.meta.env.VITE_SERVER_URL}/login`,
    {username, password},
    {withCredentials: true},
  );
  log('login successful! ', loginResponse);
  return loginResponse;
};

export const handleRegister = async (
  username: string,
  email: string,
  password: string,
) => {
  const registerResponse = await axios.post(
    `${import.meta.env.VITE_SERVER_URL}/register`,
    {username, email, password},
    {withCredentials: true},
  );
  return registerResponse;
};

// Logout function to set all States back to 0
export const handleLogout = async () => {
  const logoutResponse = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}/logout`,
    {
      withCredentials: true,
    },
  );
  return logoutResponse;
};
