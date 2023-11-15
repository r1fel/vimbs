import {useState, useEffect} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useAtom} from 'jotai';
import {logger} from '../../util/logger';
import RenderCounter from '../../util/RenderCounter';
import './ItemList.scss';
import ItemCard from '../ItemCard/ItemCard';
import {userDataAtom, isLoggedInAtom} from '../../context/userAtoms';

//! change type of image to string array later
interface Item {
  _id: string;
  name: string;
  description: string;
  picture: string;
  available: boolean;
  owner: boolean;
}

function ItemList({url, fetchFunction, trigger}: {url: string}) {
  const [userData] = useAtom(userDataAtom);
  const [isLoggedIn] = useAtom(isLoggedInAtom);
  const isUserLoggedInAndDataExists = isLoggedIn && userData.length > 0;

  RenderCounter('ItemList');

  const itemsQuery = useQuery({
    queryKey: ['item'],
    queryFn: () => fetchFunction(url),
    enabled: isUserLoggedInAndDataExists,
  });

  logger.log(
    'ItemList rendered with:',
    'fetchfunction : ',
    fetchFunction,
    'URL:',
    url,
  );

  useEffect(() => {
    const refetch = async () => {
      if (isUserLoggedInAndDataExists) {
        await itemsQuery.refetch();
        logger.log('refetch in items list:', itemsQuery);
      } else {
        logger.log(
          'refetch didnt work! trigger:',
          trigger,
          'isUserLoggedInAndDataExists:',
          isUserLoggedInAndDataExists,
        );
      }
    };
    refetch();
  }, [trigger, isUserLoggedInAndDataExists]);

  if (itemsQuery.status === 'pending') {
    logger.log(
      'useQuery started with userData:',
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
            itemOwner={item.owner}
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
