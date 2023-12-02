import { fetchItems } from '../../services/ItemServices';
import { useQuery } from '@tanstack/react-query';
import { logger } from '../../util/logger';
import './ItemDetails.scss';
import { Item } from './ItemDetailsTypes';

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
    logger.log('the item data from item details is:', itemQuery.data.data[0]);
    const item: Item = itemQuery.data.data[0];

    return (
      <div className="item-details">
        <img src={item.picture}></img>
        <h1 className="item-details__name">{item.name}</h1>
        <p className="item-details__categories">
          Kategorie: {Object.values(item.categories)[0]?.subcategories}
        </p>
        <p className="item-details__descr">{item.description}</p>
      </div>
    );
  }
}

export default ItemDetails;
