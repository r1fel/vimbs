import { fetchItems } from '../../services/ItemServices';
import { useQuery } from '@tanstack/react-query';
import { logger } from '../../util/logger';
import './ItemDetails.scss';

function ItemDetails({ id }: { id: string }) {
  // const [item, setItem] = useState({});

  const itemQuery = useQuery({
    queryKey: ['item', id],
    queryFn: () => fetchItems(`item/${id}`),
  });

  if (itemQuery.status === 'pending') {
    logger.log('item is being fetched');
    return <p>Item is loading</p>;
  }

  if (itemQuery.status === 'error') {
    logger.error('An error occured fetching the Items:', itemQuery.error);
    return <p>{JSON.stringify(itemQuery.error)}</p>;
  }

  if (itemQuery.status === 'success') {
    //get the actual data from query object
    const item = itemQuery.data.data[0];

    return (
      <div className="item-details">
        <img src={item.picture}></img>
        <h1 className="item-details__name">{item.name}</h1>
        <p className="item-details__descr">{item.description}</p>
      </div>
    );
  }
}

export default ItemDetails;
