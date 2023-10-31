import {useParams} from 'react-router-dom';

import NoAuthRedirect from '../../components/NoAuthRedirect';
import ItemDetails from '../../components/ItemDetails/ItemDetails';
import Button from '../../components/Button/Button';
import Chat from '../../components/Chat/Chat';

function DetailsPage(): JSX.Element {
  // NoAuthRedirect();

  const {id} = useParams();

  return (
    <div>
      <ItemDetails id={id} />
      <Chat />
      <Button>Reqest Item</Button>
    </div>
  );
}

export default DetailsPage;
