import axios from 'axios';
import catchAsync from '../util/catchAsync';
import {logger} from '../util/logger';

//!change URL from books to items
// fetch items - use "/mine" in the url to get my items
export const fetchItems = catchAsync(async (url: string) => {
  const fetchedItems = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}${url}
    `,
    {withCredentials: true},
  );
  logger.log(
    'The whole URL for ferching the items is:',
    `${import.meta.env.VITE_SERVER_URL}${url}
  `,
  );
  logger.log('fetching items worked:', fetchedItems);
  return fetchedItems;
});
