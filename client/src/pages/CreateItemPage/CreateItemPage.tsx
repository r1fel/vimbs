import NoAuthRedirect from '../../features/authentication/components/NoAuthRedirect';
import ItemCreateForm from '../../components/ItemCreateForm/ItemCreateForm';

function CreateItemPage(): JSX.Element {
  // NoAuthRedirect();
  return (
    <div>
      <ItemCreateForm />
    </div>
  );
}

export default CreateItemPage;
