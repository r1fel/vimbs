import {checkAuthStatus} from '../services/AuthServices';
import {logger} from '../../../util/logger';
import {useNavigate} from 'react-router-dom';

// import {useContext} from 'react';
// import UserContext from '../context/UserContext';

function NoAuthRedirect() {
  const navigate = useNavigate();
  // const {userData} = useContext(UserContext);

  const checkCurrentAuthStatus = async () => {
    const currentAuthStatus = await checkAuthStatus();
    if (currentAuthStatus === true) {
      logger.log('auth status true');
      return;
    } else {
      logger.log('auth status false, redirect now');
      navigate('/auth');
    }
  };

  return checkCurrentAuthStatus();
}

export default NoAuthRedirect;
