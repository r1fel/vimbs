import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { logger } from '../../util/logger';
import RenderCounter from '../../util/RenderCounter';
import './ItemList.scss';
import ItemCard from '../ItemCard/ItemCard';
import { userDataAtom } from '../../context/userAtoms';

//! change type of image to string array later
interface Item {
  _id: string;
  name: string;
  description: string;
  picture: string;
  available: boolean;
  owner: boolean;
}

function ItemList({ url, fetchFunction, trigger }: { url: string }) {
  const [userData] = useAtom(userDataAtom);

  RenderCounter('ItemList');

  //if my items are fetched they have a different query key
  let query;
  if (url.endsWith('/myitems')) {
    query = useQuery({
      queryKey: ['item', 'mine'],
      queryFn: () => fetchFunction(url),
      enabled: !!userData,
    });
  } else {
    query = useQuery({
      queryKey: ['item'],
      queryFn: () => fetchFunction(url),
      enabled: !!userData,
    });
  }

  useEffect(() => {
    const refetch = async () => {
      if (userData) {
        await query.refetch();
        logger.log('refetch in items list:', query);
      } else {
        logger.log(
          'refetch didnt work! trigger:',
          trigger,
          '!!userData:',
          userData,
        );
      }
    };
    refetch();
  }, [trigger, userData.length]);

  if (query.status === 'pending') {
    return <p>Items are loading</p>;
  }

  if (query.status === 'error') {
    logger.error('An error occured fetching the Items:', query.error);
    return <p>{JSON.stringify(query.error)}</p>;
  }

  if (query.status === 'success' && userData) {
    const items: Item[] = query.data.data;
    // setItems(itemsQuery.data.data);
    logger.log('Items are:', query.data.data);

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
