// import NoAuthRedirect from '../../features/authentication/components/NoAuthRedirect';
import {useState} from 'react';
import ItemList from '../../components/ItemList/ItemList';
import {fetchItems} from '../../services/ItemServices';
import NavBar from '../../components/NavBar/NavBar';

function MyItemsPage(): JSX.Element {
  const [x, setX] = useState('x');
  // NoAuthRedirect();
  return (
    <div>
      <NavBar />
      <ItemList url={'item/mine'} fetchFunction={fetchItems} trigger={x} />
    </div>
  );
}

export default MyItemsPage;
