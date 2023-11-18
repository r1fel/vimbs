import {
  useMutation,
  QueryClient,
  useQueryClient,
} from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import '../../../components/NavBar/NavBar.scss';
import { userDataAtom, isLoggedInAtom } from '../../../context/userAtoms';
import { handleLogout } from '../services/AuthServices';
import { IoLogOutOutline } from 'react-icons/io5';
import { logger } from '../../../util/logger';

function LogoutButton({ className }) {
  const [userData, setUserData] = useAtom(userDataAtom);
  const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationKey: ['logout'],
    mutationFn: handleLogout,
    onSuccess: async () => {
      // queryClient.setQueryData(['item', itemData.data[0]._id], itemData);
      queryClient.invalidateQueries(['auth'], { exact: true });
      await setUserData('');
      await setIsLoggedIn(false);
      logger.log('logout mutation successful');
      navigate('/auth');
    },
  });

  return (
    <IoLogOutOutline className={className} onClick={logoutMutation.mutate} />
  );
}

export default LogoutButton;
