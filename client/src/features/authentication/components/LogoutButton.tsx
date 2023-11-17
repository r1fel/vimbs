import {useQuery} from '@tanstack/react-query';
import {redirect, useNavigate} from 'react-router-dom';
import {useAtom} from 'jotai';
import {userDataAtom, isLoggedInAtom} from '../../../context/userAtoms';
import {handleLogout} from '../services/AuthServices';

function LogoutButton() {
  const [userData, setUserData] = useAtom(userDataAtom);
  const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom);

  const navigate = useNavigate();

  const authQuery = useQuery({
    queryKey: ['auth', 'logout'],
    queryFn: handleLogout,
    onSucess: async () => {
      setUserData('');
      setIsLoggedIn(false);
      navigate('/auth');
    },
  });
}

export default LogoutButton;
