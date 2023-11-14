import NoAuthRedirect from '../../features/authentication/components/NoAuthRedirect';
import ItemCreateForm from '../../components/ItemCreateForm/ItemCreateForm';
import NavBar from '../../components/NavBar/NavBar';

function CreateItemPage(): JSX.Element {
  // NoAuthRedirect();
  return (
    <div>
      <NavBar />
      <ItemCreateForm />
    </div>
  );
}

export default CreateItemPage;
