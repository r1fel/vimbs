import {useParams} from 'react-router-dom';
import {Link} from 'react-router-dom';

import NoAuthRedirect from '../../components/NoAuthRedirect';
import ItemDetails from '../../components/ItemDetails/ItemDetails';
import Button from '../../components/Button/Button';
import Chat from '../../components/Chat/Chat';
import {initializeRequest} from '../../services/ItemServices';

function DetailsPage(): JSX.Element {
  // NoAuthRedirect();

  const {id} = useParams();

  return (
    <div>
      <ItemDetails id={id} />
      <Chat />
      <Link to={`items/${id}/request`}>
        <Button>Reqest Item</Button>
      </Link>
    </div>
  );
}

export default DetailsPage;
