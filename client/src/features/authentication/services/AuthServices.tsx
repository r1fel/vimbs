import axios from 'axios';
import {logger} from '../../../util/logger';
import catchAsync from '../../../util/catchAsync';

//TODO FR: How does auth process work?
export const checkAuthStatus = catchAsync(async () => {
  const authStatusResponse = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}/auth`,
  );
  const authStatusData = authStatusResponse.data;
  logger.log('Current auth status is: ');

  return authStatusData;
});

export const handleLogin = catchAsync(
  async (email: string, password: string) => {
    const loginResponse = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}login`,
      {email, password},
      {withCredentials: true},
    );
    return loginResponse;
  },
);

export const handleGoogleLogin = () => {
  window.open(`${import.meta.env.VITE_SERVER_URL}auth/google`, '_self');
};

export const handleRegister = catchAsync(
  async (email: string, password: string) => {
    const registerResponse = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}register`,
      {email, password},
      {withCredentials: true},
    );
    return registerResponse;
  },
);

// Logout function to set all States back to 0
export const handleLogout = catchAsync(async () => {
  const logoutResponse = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}logout`,
    {
      withCredentials: true,
    },
  );
  return logoutResponse;
});
