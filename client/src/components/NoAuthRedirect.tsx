import {checkAuthStatus} from '../services/AuthServices';
import log from '../util/log';
import {useNavigate} from 'react-router-dom';

function NoAuthRedirect() {
  const navigate = useNavigate();

  const checkCurrentAuthStatus = async () => {
    const currentAuthStatus = await checkAuthStatus();
    if (currentAuthStatus === true) {
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
