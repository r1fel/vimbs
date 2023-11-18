// import NoAuthRedirect from '../../features/authentication/components/NoAuthRedirect';
import { useState } from 'react';
import ItemList from '../../components/ItemList/ItemList';
import { fetchItems } from '../../services/ItemServices';
import NavBar from '../../components/NavBar/NavBar';
import { useAtom } from 'jotai';
import { isDeleteItemModalOpenAtom } from '../../context/itemAtoms';
import Modal from '../../components/Modal/Modal';

function MyItemsPage(): JSX.Element {
  const [x, setX] = useState('x');
  const [isModalOpen, setIsModalOpen] = useAtom(isDeleteItemModalOpenAtom);
  // NoAuthRedirect();
  return (
    <div>
      <NavBar />
      <Modal>HAllo</Modal>
      <ItemList url={'item/mine'} fetchFunction={fetchItems} trigger={x} />
    </div>
  );
}

export default MyItemsPage;
