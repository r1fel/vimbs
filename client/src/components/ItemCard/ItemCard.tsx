import {logger} from '../../util/logger';
import shortenText from '../../util/shortenText';
import './ItemCard.scss';
import {Link} from 'react-router-dom';

interface ItemCardProps {
  itemId: string;
  itemName: string;
  itemDescription: string;
  itemImages: string;
}

function ItemCard({
  itemId,
  itemName,
  itemDescription,
  itemImages,
}: ItemCardProps) {
  const shortName = shortenText(15, itemName);
  const shortDescription = shortenText(70, itemDescription);

  return (
    <Link className="item-card__link" to={`items/${itemId}`}>
      <div className="item-card">
        <img className="item-card__img" src={itemImages}></img>
        <h1 className="item-card__name">{shortName}</h1>
        <p className="item-card__descr">{shortDescription}</p>
      </div>
    </Link>
  );
}

export default ItemCard;
