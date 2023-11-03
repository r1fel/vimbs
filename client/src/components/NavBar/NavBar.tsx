import {
  IoStorefront,
  IoPersonCircleOutline,
  IoSearch,
  IoAddCircleOutline,
} from 'react-icons/io5';
import {Link} from 'react-router-dom';

function NavBar() {
  return (
    <div className="navbar">
      <Link to="/">
        <IoStorefront />
      </Link>

      <Link to="/settings">
        <IoAddCircleOutline />
      </Link>

      <IoSearch />

      <Link to="/settings">
        <IoPersonCircleOutline />
      </Link>
    </div>
  );
}

export default NavBar;
