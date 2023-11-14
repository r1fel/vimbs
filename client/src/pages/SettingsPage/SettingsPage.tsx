import NoAuthRedirect from '../../features/authentication/components/NoAuthRedirect';
import UserSettings from '../../components/UserSettings/UserSettings';
import NavBar from '../../components/NavBar/NavBar';

function SettingsPage(): JSX.Element {
  NoAuthRedirect();

  return (
    <div>
      <NavBar />
      <UserSettings />;
    </div>
  );
}

export default SettingsPage;
