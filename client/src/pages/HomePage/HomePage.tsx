import Button from '../../components/Button/Button';
import './HomePage.scss';

function HomePage(): JSX.Element {
  return (
    <div>
      Home Page
      <Button>This is a button</Button>
      <div className="test">hello</div>
    </div>
  );
}

export default HomePage;
