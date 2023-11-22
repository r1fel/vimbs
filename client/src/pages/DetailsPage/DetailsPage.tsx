import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import NoAuthRedirect from '../../features/authentication/components/NoAuthRedirect';
import ItemDetails from '../../components/ItemDetails/ItemDetails';
import Button from '../../components/Button/Button';
import Chat from '../../components/Chat/Chat';
import NavBar from '../../components/NavBar/NavBar';

function DetailsPage(): JSX.Element {
  NoAuthRedirect();

  const { id } = useParams();

  return (
    <div>
      <NavBar />
      <ItemDetails id={id} />
      <Chat />
      <Link to={`item/${id}/request`}>
        <Button>Reqest Item</Button>
      </Link>
    </div>
  );
}

export default DetailsPage;
