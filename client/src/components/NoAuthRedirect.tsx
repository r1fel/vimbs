import {checkAuthStatus} from '../services/AuthServices';
import log from '../util/log';
import {useNavigate} from 'react-router-dom';
import {useContext} from 'react';
import UserContext from '../context/UserContext';

function NoAuthRedirect() {
  const navigate = useNavigate();
  const {userData} = useContext(UserContext);

  const checkCurrentAuthStatus = async () => {
    const currentAuthStatus = await checkAuthStatus();
    if (currentAuthStatus === true && userData) {
      log('auth status true');
      return;
    } else {
      log('auth status false, redirect now');
      navigate('/auth');
    }
  };
  checkCurrentAuthStatus();
  return null;
}

export default NoAuthRedirect;
