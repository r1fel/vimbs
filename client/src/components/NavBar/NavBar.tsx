import { useState } from 'react';
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
import DropdownMenu from '../DropdownMenu/DropdownMenu';

function NavBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);

  return (
    <div className="navbar">
      <Link className="navbar__logo" to="/">
        <IoStorefront />
      </Link>

      <div className="navbar__links">
        <div
          className="navbar__icon-circle navbar__link"
          onClick={() => setIsSearchBarOpen(!isSearchBarOpen)}
        >
          <IoSearch />
        </div>
        <Link className="navbar__link" to="/item/new">
          <div className="navbar__icon-circle">
            <IoAddCircleOutline />
          </div>
        </Link>

        <Link className="navbar__link" to="/settings">
          <div className="navbar__icon-circle">
            <RiFeedbackLine />
          </div>
        </Link>

        <Link className="navbar__link" to="/user/notifications">
          <div className="navbar__icon-circle">
            <IoNotificationsOutline />
          </div>
        </Link>
        <div
          className="navbar__icon-circle navbar__link"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <IoPersonCircleOutline />
        </div>
        <DropdownMenu isOpen={isDropdownOpen} />
      </div>
    </div>
  );
}

export default NavBar;
