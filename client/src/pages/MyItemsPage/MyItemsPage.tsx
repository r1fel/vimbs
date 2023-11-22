// import NoAuthRedirect from '../../features/authentication/components/NoAuthRedirect';
import { useState } from 'react';
import ItemList from '../../components/ItemList/ItemList';
import { fetchItems } from '../../services/ItemServices';
import NavBar from '../../components/NavBar/NavBar';
import { useAtom } from 'jotai';
import { userDataAtom } from '../../context/userAtoms';

function MyItemsPage(): JSX.Element {
  const [userData, setUserData] = useAtom(userDataAtom);

  // NoAuthRedirect();
  return (
    <div>
      <NavBar />
      <ItemList
        url={`user/${userData._id}/inventory/myitems`}
        fetchFunction={fetchItems}
      />
    </div>
  );
}

export default MyItemsPage;
