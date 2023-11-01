import axios from 'axios';
import catchAsync from '../util/catchAsync';
import {logger} from '../util/logger';

//!change URL from books to items
// fetch items - use "/mine" in the url to get my items
export const fetchItems = catchAsync(async (url: string) => {
  const fetchedItems = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}${url}`,
    {withCredentials: true},
  );

  logger.log(
    'The whole URL for fetching the items is:',
    `${import.meta.env.VITE_SERVER_URL}${url}`,
  );

  logger.log('fetching items worked:', fetchedItems);
  return fetchedItems;
});

export const initializeRequest = catchAsync(
  async (itemId, message, status, dueDate) => {
    const input = {
      borrowingrequest: {
        status: `${status}`,
        message: `${message}`,
        dueDate: `${dueDate}`,
      },
    };
    //withCredentials = cookie info is passed through
    const response = await axios.post(
      `http://localhost:8080/books/${itemId}/borrowingrequest`,
      input,
      {withCredentials: true},
    );
    return response.data;
  },
);
