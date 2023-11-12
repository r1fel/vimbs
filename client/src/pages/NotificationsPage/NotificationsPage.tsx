import NoAuthRedirect from '../../features/authentication/components/NoAuthRedirect';

function NotificationsPage(): JSX.Element {
  NoAuthRedirect();
  return <div>Notifications Page</div>;
}

export default NotificationsPage;
