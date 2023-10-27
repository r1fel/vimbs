import {logger} from '../../util/logger';
import RenderCounter from '../../util/renderCounter';
import {useState, useEffect} from 'react';
import Card from '../Card/ItemCard';
import './ItemList.scss';
import {fetchItems} from '../../services/ItemServices';

function ItemList(url: string) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const fetchedItems = await fetchItems(url);
      setItems(fetchedItems.data);
    };
    fetchData();
  }, [url]);

  logger.log('The currently fetched items are: ', items);
  RenderCounter('ItemList');

  // const renderCards = () => {
  //   if (!items) return <p>loading Itemcards</p>;

  //   return items.map((item, index) => (
  //     <Card
  //       itemName={itemName}
  //       itemDescription={itemDescription}
  //       itemImages={itemImages}
  //     ></Card>
  //   ));
  // };

  // if (!items || items.length === 0) {
  //   return <div>No items available.</div>;
  // }

  return (
    <div className="section__item-cards">
      <div className="item-cards--rendered">{}</div>
    </div>
  );
}

export default ItemList;
