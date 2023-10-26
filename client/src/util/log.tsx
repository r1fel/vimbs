import getTime from './getTime';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function log(...args: any) {
  if (import.meta.env.MODE !== 'production') {
    console.log(getTime(), ...args);
  } else {
    //! in production log to file!
    return;
  }
}

export default log;
