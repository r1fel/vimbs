import axios from 'axios';
import catchAsync from '../util/catchAsync';
import { logger } from '../util/logger';

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
    `${import.meta.env.VITE_SERVER_URL}item/search?q=${searchTerm}`,
    {
      withCredentials: true,
    },
  );
  logger.log('searching items worked:', response);
  return response;
});

// create item
export const createItem = catchAsync(
  async ({
    name,
    description,
    picture,
    categories,
  }: {
    name: string;
    description: string;
    picture: string;
    categories: { string };
  }) => {
    logger.log('service receives:', name, description, picture, categories);
    const input = {
      item: {
        name,
        description,
        picture,
        categories,
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

// edit item
export const editItem = catchAsync(
  async ({
    id,
    name,
    description,
    picture,
  }: {
    id: string;
    name: string;
    description: string;
    picture: string;
  }) => {
    logger.log('service receives:', name, description, picture);
    const input = {
      item: {
        name,
        description,
        picture,
      },
    };

    const response = await axios.put(
      `${import.meta.env.VITE_SERVER_URL}item/${id}`,
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

//delete item
export const deleteItem = catchAsync(async ({ id }: { id: string }) => {
  const response = await axios.delete(
    `${import.meta.env.VITE_SERVER_URL}item/${id}`,
    {
      withCredentials: true,
    },
  );
  logger.log('delete item worked:', response);
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
      { withCredentials: true },
    );
    return response.data;
  },
);
