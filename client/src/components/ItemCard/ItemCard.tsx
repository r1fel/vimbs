import { useState } from 'react';
import { Link } from 'react-router-dom';
import { logger } from '../../util/logger';
import shortenText from '../../util/shortenText';
import './ItemCard.scss';
import { IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import Modal from '../../components/Modal/Modal';
import Button from '../Button/Button';

interface ItemCardProps {
  itemId: string;
  itemName: string;
  itemDescription: string;
  itemImages: string;
  itemAvailable: boolean;
  itemOwner: boolean;
}

function ItemCard({
  itemId,
  itemName,
  itemDescription,
  itemImages,
  itemAvailable,
  itemOwner,
}: ItemCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const shortName = shortenText(15, itemName);
  const shortDescription = shortenText(70, itemDescription);

  const openModal = () => {
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="item-card">
      <Modal isOpen={isDeleteModalOpen} setIsOpen={setIsDeleteModalOpen}>
        do you really want to delete {itemName}
        <Button onClick={() => setIsDeleteModalOpen(false)}>cancel</Button>{' '}
        <Button>Yes</Button>
      </Modal>
      {itemOwner && (
        <Link className="item-card__link--edit" to={`/item/${itemId}/edit`}>
          <IoCreateOutline className="item-card__edit" />
        </Link>
      )}
      {itemOwner && (
        <IoTrashOutline className="item-card__delete" onClick={openModal} />
      )}
      <Link className="item-card__link" to={`/item/${itemId}`}>
        <img className="item-card__img" src={itemImages}></img>
        <h1 className="item-card__name">{shortName}</h1>
        <p className="item-card__descr">{shortDescription}</p>
        <div className="item-card__status">
          {itemAvailable ? (
            <p className="item-card__status--available">available</p>
          ) : (
            <p className="item-card__status--not-available">not available</p>
          )}
        </div>
      </Link>
    </div>
  );
}

export default ItemCard;
