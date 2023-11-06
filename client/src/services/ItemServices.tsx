import axios from 'axios';
import catchAsync from '../util/catchAsync';
import {logger} from '../util/logger';

// fetch items - use "/mine" in the url to get my items
export const fetchItems = catchAsync(async (url: string) => {
  const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}${url}`, {
    withCredentials: true,
  });
  logger.log('fetching items worked:', response);
  return response;
});

//search items
export const searchItems = catchAsync(async (searchTerm: string) => {
  const response = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}/suggestions?term=${searchTerm}`,
  );
  logger.log('searching items worked:', response);
  return response;
});

//initalize new borrowing request
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
