import {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {fetchItems} from '../../services/ItemServices';
import {logger} from '../../util/logger';
import catchAsync from '../../util/catchAsync';
import NoAuthRedirect from '../../components/NoAuthRedirect';

function DetailsPage(): JSX.Element {
  const {id} = useParams();
  const [item, setItem] = useState({});

  useEffect(() => {
    logger.log('useEffect started');
    const fetchData = catchAsync(async () => {
      const fetchedItem = await fetchItems(`books/${id}`);
      setItem(fetchedItem.data);
      logger.log('DetailsPage fetched this item: ', fetchedItem);
    });
    fetchData();
  }, [id]);

  // NoAuthRedirect();

  return <div>Details Page</div>;
}

export default DetailsPage;
