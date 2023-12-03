import ReactDom from 'react-dom';
import { ModalProps } from './ModalTypes';

import './Modal.scss';

function Modal({ isOpen, children }: ModalProps) {
  if (!isOpen) return null;

  const portalElement = document.getElementById('portal');

  if (!portalElement) {
    console.error("Element with id 'portal' not found");
    return null;
  }

  return ReactDom.createPortal(
    <>
      <div className="modal__overlay"></div>
      <div className="modal">{children}</div>
    </>,
    portalElement,
  );
}

export default Modal;
