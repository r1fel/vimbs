import NoAuthRedirect from '../../features/authentication/components/NoAuthRedirect';

function SettingsPage(): JSX.Element {
  NoAuthRedirect();
  return <div>Settings Page</div>;
}

export default SettingsPage;
