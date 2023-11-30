import { useEffect } from 'react';
import {
  useMutation,
  QueryClient,
  useQueryClient,
} from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import '../../../../components/NavBar/NavBar.scss';
import { userDataAtom } from '../../../../context/userAtoms';
import { handleLogout } from '../../services/AuthServices';
import { IoLogOutOutline } from 'react-icons/io5';
import { logger } from '../../../../util/logger';
import '../../../../components/DropdownMenu/DropdownMenu.scss';

function Logout({ className, children }) {
  const [userData, setUserData] = useAtom(userDataAtom);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationKey: ['logout'],
    mutationFn: handleLogout,
    onSuccess: async () => {
      // queryClient.setQueryData(['item', itemData.data[0]._id], itemData);
      queryClient.invalidateQueries(['auth'], { exact: true });
      await setUserData('');
      logger.log('logout mutation done. result:', logoutMutation);
      navigate('/auth');
    },
  });

  // if (logoutMutation.status === 'success') {
  //   async () => {
  //     // queryClient.setQueryData(['item', itemData.data[0]._id], itemData);
  //     queryClient.invalidateQueries(['auth'], { exact: true });
  //     await setUserData('');
  //     logger.log('logout mutation done. result:', logoutMutation);
  //     navigate('/auth');
  //   };
  // }

  // useEffect(
  //   () => {
  //     logger.log('Use Efect: logout mutation done. result:', logoutMutation);
  //   },
  //   logoutMutation.status,
  //   logoutMutation,
  // );

  // const logoutFunction = async () => {
  //   await handleLogout();
  //   await setUserData('');
  // };

  return (
    <div className={className} onClick={logoutMutation.mutate}>
      {children}
    </div>
  );
}

export default Logout;
