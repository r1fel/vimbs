import NoAuthRedirect from '../../features/authentication/components/NoAuthRedirect';

function RequestPage(): JSX.Element {
  NoAuthRedirect();
  return <div>RequestPage</div>;
}

export default RequestPage;
