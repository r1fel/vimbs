import Button from '../Button/Button';
import './Modal.scss';

function Modal({ isOpen, setIsOpen, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-delete-item">
      {children}
      <Button
        onClick={() => {
          setIsOpen(false);
        }}
      >
        Close
      </Button>
    </div>
  );
}

export default Modal;
