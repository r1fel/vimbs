import {logger} from '../../util/logger';
import './ItemCard.scss';

function ItemCard({itemName, itemDescription, itemImages}) {
  return (
    <div>
      <h1>{itemName}</h1>
      <p>{itemDescription}</p>
      <img src={itemImages}></img>
      <div>something</div>
    </div>
  );
}

export default ItemCard;
