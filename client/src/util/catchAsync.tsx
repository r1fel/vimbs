import {logger} from './logger';

function catchAsync(asyncFunction: any) {
  return async function (...args: any) {
    try {
      return await asyncFunction(...args);
    } catch (error) {
      logger.error('An error occurred:', error);
      console.error('An error occurred:', error);
      throw error;
    }
  };
}

export default catchAsync;
