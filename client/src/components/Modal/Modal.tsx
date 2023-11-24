import ReactDom from 'react-dom';

import './Modal.scss';

function Modal({ isOpen, children }) {
  if (!isOpen) return null;

  return ReactDom.createPortal(
    <>
      <div className="modal__overlay"></div>
      <div className="modal">{children}</div>
    </>,
    document.getElementById('portal'),
  );
}

export default Modal;
