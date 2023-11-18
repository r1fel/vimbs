import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { checkAuthStatus } from '../services/AuthServices';
import { logger } from '../../../util/logger';
import { userDataAtom, isLoggedInAtom } from '../../../context/userAtoms';

function NoAuthRedirect() {
  const navigate = useNavigate();
  const [userData] = useAtom(userDataAtom);
  const [isLoggedIn] = useAtom(isLoggedInAtom);
  const currentURL = window.location.pathname;

  const authQuery = useQuery({
    queryKey: ['auth'],
    queryFn: checkAuthStatus,
  });

  useEffect(() => {
    const handleAuthStatus = () => {
      if (authQuery.isSuccess) {
        logger.log(
          'authQuery details are :',
          authQuery.data,
          'isLoggedIn',
          isLoggedIn,
          'userData:',
          userData,
          'currentURL:',
          currentURL,
        );
        if (
          authQuery.data &&
          isLoggedIn &&
          userData &&
          window.location.pathname === '/auth'
        ) {
          logger.log('auth status true, going from auth back to the main page');
          navigate('/');
        } else if (authQuery.data && isLoggedIn && userData) {
          logger.log('auth status true');
          return;
        } else {
          logger.log('auth status false, redirect now');
          navigate('/auth');
        }
      }

      if (authQuery.isError) {
        logger.error('could not fetch auth status:', authQuery.error);
        navigate('/auth');
      }
    };

    handleAuthStatus();
  }, [authQuery, isLoggedIn, userData, currentURL]);
}

export default NoAuthRedirect;
