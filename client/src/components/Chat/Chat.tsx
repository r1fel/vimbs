import {useState} from 'react';
import './Chat.scss';
import NoAuthRedirect from '../../components/NoAuthRedirect';
import Button from '../Button/Button';

function Chat() {
  NoAuthRedirect();

  return (
    <div className="chat">
      <div className="chat__msg-log"></div>
      <div>
        <input type="text" className="chat__input" />
        <Button>Send</Button>
      </div>
    </div>
  );
}

export default Chat;
