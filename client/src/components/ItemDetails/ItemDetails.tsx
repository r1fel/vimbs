import {useState, useEffect} from 'react';
import {fetchItems} from '../../services/ItemServices';
import catchAsync from '../../util/catchAsync';
import {logger} from '../../util/logger';
import './ItemDetails.scss';

function ItemDetails({id}: {id: string}) {
  const [item, setItem] = useState({});

  useEffect(() => {
    logger.log('useEffect started');
    const fetchData = catchAsync(async () => {
      const fetchedItem = await fetchItems(`item/${id}`);
      setItem(fetchedItem.data[0]);
      logger.log('Item Details fetched this item: ', fetchedItem);
    });
    fetchData();
  }, [id]);

  return (
    <div className="item-details">
      <img src={item.picture}></img>
      <h1 className="item-details__name">{item.name}</h1>
      <p className="item-details__descr">{item.description}</p>
    </div>
  );
}

export default ItemDetails;
