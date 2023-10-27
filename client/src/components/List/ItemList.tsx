import {logger} from '../../util/logger';
import RenderCounter from '../../util/renderCounter';
import {useState, useEffect} from 'react';
import ItemCard from '../ItemCard/ItemCard';
import './ItemList.scss';
import {fetchItems} from '../../services/ItemServices';
import catchAsync from '../../util/catchAsync';

function ItemList({url}: {url: string}) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    logger.log('useEffect started');
    const fetchData = catchAsync(async () => {
      const fetchedItems = await fetchItems(url);
      setItems(fetchedItems.data);
      logger.log('The currently fetched items are: ', fetchedItems.data);
    });
    fetchData();
  }, [url]);

  RenderCounter('ItemList');

  const renderCards = () => {
    if (items.length > 0) {
      return items.map((item) => (
        <ItemCard
          key={`item-card-${item._id}`}
          itemName={item.title}
          itemDescription={item.blurb}
          itemImages={item.image}
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
