import { useParams } from 'react-router-dom';
import ItemEditForm from '../../components/ItemEditForm/ItemEditForm';
import NavBar from '../../components/NavBar/NavBar';
import NoAuthRedirect from '../../features/authentication/components/NoAuthRedirect';

function EditItemPage(): JSX.Element {
  NoAuthRedirect();

  const { id } = useParams();

  return (
    <div>
      <NavBar />
      <ItemEditForm id={id} />
    </div>
  );
}

export default EditItemPage;
