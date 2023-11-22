import { Link } from 'react-router-dom';
import './NavBar.scss';
import {
  IoStorefront,
  IoPersonCircleOutline,
  IoSearch,
  IoAddCircleOutline,
  IoNotificationsOutline,
} from 'react-icons/io5';
import { RiFeedbackLine } from 'react-icons/ri';
import LogoutButton from '../../features/authentication/components/LogoutButton';

function NavBar() {
  return (
    <div className="navbar">
      <Link className="navbar__link" to="/">
        <IoStorefront />
      </Link>

      <div className="navbar__links">
        <IoSearch className="navbar__link" />

        <Link className="navbar__link" to="/item/new">
          <IoAddCircleOutline />
        </Link>

        <Link className="navbar__link" to="/settings">
          <RiFeedbackLine />
        </Link>

        <Link className="navbar__link" to="/user/notifications">
          <IoNotificationsOutline />
        </Link>

        <Link className="navbar__link" to="/settings">
          <IoPersonCircleOutline />
        </Link>
        <LogoutButton className="navbar__link" />
      </div>
    </div>
  );
}

export default NavBar;
