import {logger} from '../../util/logger';
import shortenText from '../../util/shortenText';
import './ItemCard.scss';

function ItemCard({itemName, itemDescription, itemImages}) {
  const shortName = shortenText(15, itemName);
  const shortDescription = shortenText(70, itemDescription);

  return (
    <div className="item-card">
      <img className="item-card__img" src={itemImages}></img>
      <h1 className="item-card__name">{shortName}</h1>
      <p className="item-card__descr">{shortDescription}</p>
    </div>
  );
}

export default ItemCard;
