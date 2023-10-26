import getTime from './getTime';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function log(...args: any) {
  console.log(getTime(), ...args);
}

export default log;
