import NoAuthRedirect from '../../features/authentication/components/NoAuthRedirect';
import { Link } from 'react-router-dom';
import UserSettings from '../../components/UserSettings/UserSettings';
import NavBar from '../../components/NavBar/NavBar';
import Button from '../../components/Button/Button';

function SettingsPage(): JSX.Element {
  // NoAuthRedirect();

  return (
    <div>
      <NavBar />
      <UserSettings />
      <Link to={'/user/myitems'}>
        <Button>Show my Items</Button>
      </Link>
    </div>
  );
}

export default SettingsPage;
