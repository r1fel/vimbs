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
    `${import.meta.env.VITE_SERVER_URL}search/?q=${searchTerm}`,
  );
  logger.log('searching items worked:', response);
  return response;
});

// create item
export const createItem = catchAsync(
  async (name: string, description: string, picture: string) => {
    const input = {
      item: {
        name,
        description,
        picture,
      },
    };

    const response = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}item/`,
      input,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    logger.log('creating item worked:', response);
    return response;
  },
);

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
