import {checkAuthStatus} from '../services/AuthServices';
import {useEffect, useState} from 'react';
import {redirect, useNavigate} from 'react-router-dom';
import catchAsync from '../../../util/catchAsync';
import {logger} from '../../../util/logger';

function AuthCheck({children}: {children: any}) {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyStatus = catchAsync(async () => {
      const authStatus = await checkAuthStatus();
      logger.log('current auth status is:', authStatus);
      if (authStatus === true) {
        return children;
      } else {
        logger.log('redirect should start');
        return redirect('/auth');
        // return navigate('/auth');
      }
    });
    verifyStatus();
  }, []);
}

export default AuthCheck;
