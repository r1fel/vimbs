import { Link } from 'react-router-dom';
import './DropdownMenu.scss';
import {
  IoSettingsOutline,
  IoAlbumsOutline,
  IoLogOutOutline,
} from 'react-icons/io5';
import Logout from '../../features/authentication/components/Logout/Logout';
<IoLogOutOutline />;
function DropdownMenu({ isOpen }: { isOpen: boolean }) {
  return (
    <div
      className={`dropdown-menu ${
        isOpen ? 'dropdown-menu--open' : 'dropdown-menu--closed'
      }`}
    >
      <Link className="dropdown-menu__item" to={'/settings'}>
        <IoSettingsOutline /> Settings
      </Link>
      <Link className="dropdown-menu__item" to={'/user/myitems'}>
        {' '}
        <IoAlbumsOutline /> My Items
      </Link>
      <Logout className="dropdown-menu__item">
        <IoLogOutOutline /> Logout
      </Logout>
    </div>
  );
}

export default DropdownMenu;
