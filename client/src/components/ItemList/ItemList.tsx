import {useState, useContext} from 'react';
import {fetchItems} from '../../services/ItemServices';
import {logger} from '../../util/logger';
import RenderCounter from '../../util/RenderCounter';
import './ItemList.scss';
import ItemCard from '../ItemCard/ItemCard';
import UserContext from '../../context/UserContext';
import {useQuery} from '@tanstack/react-query';

//! change type of image to string array later
interface Item {
  _id: string;
  name: string;
  description: string;
  picture: string;
  available: boolean;
}

function ItemList({url}: {url: string}) {
  const {userData, isLoggedIn} = useContext(UserContext);
  const isUserLoggedInAndDataExists = isLoggedIn && userData.length > 0;

  const itemsQuery = useQuery({
    queryKey: ['fetchItems'],
    queryFn: () => fetchItems(url),
    enabled: isUserLoggedInAndDataExists,
  });

  if (itemsQuery.status === 'pending') {
    logger.log(
      'useUery started with userData:',
      userData,
      'and isLoggedIn:',
      isLoggedIn,
    );
    return <p>Items are loading</p>;
  }

  if (itemsQuery.status === 'error') {
    logger.error('An error occured fetching the Items:', itemsQuery.error);
    return <p>{JSON.stringify(itemsQuery.error)}</p>;
  }

  if (itemsQuery.status === 'success') {
    const items: Item[] = itemsQuery.data.data;
    // setItems(itemsQuery.data.data);
    logger.log('Items are:', itemsQuery.data.data);

    // RenderCounter('ItemList');

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
}

export default ItemList;
