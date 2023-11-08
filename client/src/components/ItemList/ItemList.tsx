import {useState, useEffect, useContext} from 'react';
import {fetchItems} from '../../services/ItemServices';
import {logger} from '../../util/logger';
import RenderCounter from '../../util/RenderCounter';
import './ItemList.scss';
import ItemCard from '../ItemCard/ItemCard';
import catchAsync from '../../util/catchAsync';
import UserContext from '../../context/UserContext';
import {useQuery, useMutation} from '@tanstack/react-query';

// export const fetchItems2 = useQuery({
//   queryKey:['fetchItems'],
//   queryFn:  axios.get(`${import.meta.env.VITE_SERVER_URL}${url}`, {
//     withCredentials: true,
//   });

//! change type of image to string array later
interface Item {
  _id: string;
  name: string;
  description: string;
  picture: string;
  available: boolean;
}

function ItemList({url}: {url: string}) {
  const [items, setItems] = useState<Item[]>([]);
  const {userData, isLoggedIn} = useContext(UserContext);

  //fetching the items with the specific endpoint URL
  useEffect(() => {
    logger.log(
      'useEffect started with userData:',
      userData,
      'and isLoggedIn:',
      isLoggedIn,
    );
    if (userData && isLoggedIn) {
      const fetchData = catchAsync(async () => {
        const fetchedItems = await fetchItems(url);
        setItems(fetchedItems.data);
        logger.log('The currently fetched items are: ', fetchedItems.data);
      });
      fetchData();
    } else {
      logger.error('not fetching items');
    }
  }, [url, userData, isLoggedIn]);

  RenderCounter('ItemList');

  const renderCards = () => {
    if (items.length > 0) {
      return items.map((item) => (
        <ItemCard
          key={`item-card-${item._id}`}
          itemId={item._id}
          itemName={item.name}
          itemDescription={item.description}
          itemImages={item.picture}
          itemAvailable={item.available}
        ></ItemCard>
      ));
    } else {
      return <p>loading Itemcards</p>;
    }
  };

  return (
    <div className="section__item-cards">
      <div className="item-cards--rendered">{renderCards()}</div>
    </div>
  );
}

export default ItemList;
