import {useState, useEffect} from 'react';
import {fetchItems} from '../../services/ItemServices';
import {logger} from '../../util/logger';
import RenderCounter from '../../util/RenderCounter';
// import catchAsync from '../../util/catchAsync';
import './ItemList.scss';
import ItemCard from '../ItemCard/ItemCard';
import catchAsync from '../../util/catchAsync';

//! change type of image to string array later
interface Item {
  _id: string;
  title: string;
  blurb: string;
  image: string;
  available: boolean;
}

function ItemList({url}: {url: string}) {
  const [items, setItems] = useState<Item[]>([]);

  // fetchItems(url);

  //fetching the items with the specific endoint URL
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
          itemId={item._id}
          itemName={item.title}
          itemDescription={item.blurb}
          itemImages={item.image}
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
