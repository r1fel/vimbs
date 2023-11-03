import {Link} from 'react-router-dom';
import './NavBar.scss';
import {RiFeedbackLine} from 'react-icons/ri';
import {
  IoStorefront,
  IoPersonCircleOutline,
  IoSearch,
  IoAddCircleOutline,
} from 'react-icons/io5';

function NavBar() {
  return (
    <div className="navbar">
      <Link className="navbar__link" to="/">
        <IoStorefront />
      </Link>

      <div className="navbar__links">
        <Link className="navbar__link" to="/settings">
          <IoAddCircleOutline />
        </Link>

        <IoSearch className="navbar__link" />

        <Link className="navbar__link" to="/settings">
          <IoPersonCircleOutline />
        </Link>

        <Link className="navbar__link" to="/settings">
          <RiFeedbackLine />
        </Link>
      </div>
    </div>
  );
}

export default NavBar;
