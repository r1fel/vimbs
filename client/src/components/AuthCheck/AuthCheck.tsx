import {checkAuthStatus} from '../../services/AuthServices';
import {useEffect} from 'react';
import {redirect} from 'react-router-dom';
import catchAsync from '../../util/catchAsync';
function AuthCheck({children}) {
  useEffect(() => {
    const verifyStatus = catchAsync(async () => {
      const authStatus = await checkAuthStatus();
      if (authStatus === true) {
        return children;
      } else {
        redirect('/auth');
      }
    });
    verifyStatus();
  }, []);
}

export default AuthCheck;
