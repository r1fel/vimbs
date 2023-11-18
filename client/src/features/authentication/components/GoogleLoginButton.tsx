import { useQuery, useQueryClient, QueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import '../../../components/NavBar/NavBar.scss';
import { userDataAtom, isLoggedInAtom } from '../../../context/userAtoms';
import { handleGoogleLogin } from '../services/AuthServices';
import { logger } from '../../../util/logger';
import Button from '../../../components/Button/Button';

function GoogleLoginButton() {
  const [userData, setUserData] = useAtom(userDataAtom);
  const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const googleLoginQuery = useQuery({
    queryKey: ['login', 'google'],
    queryFn: handleGoogleLogin,
    enabled: false,
    // onSuccess: async () => {
    //   // queryClient.setQueryData(['item', itemData.data[0]._id], itemData);
    //   queryClient.invalidateQueries(['auth'], { exact: true });
    //   await setUserData('');
    //   await setIsLoggedIn(false);
    //   logger.log('logout mutation successful');
    //   navigate('/auth');
    // },
  });

  return (
    <Button onClick={googleLoginQuery.refetch}>Login Button with Google</Button>
  );
}

export default GoogleLoginButton;
