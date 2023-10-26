import getTime from './getTime';

// eslint-disable-next-line @typescript-eslint/no-explicit-any

function getCallingComponent() {
  // Use stack trace to identify the calling component
  const error = new Error();
  const stack = error.stack.split('\n');
  for (let i = 2; i < stack.length; i++) {
    if (stack[i].includes('/src/')) {
      const callingComponent = stack[i].match(/\/(\w+)\.js/);
      if (callingComponent) {
        return callingComponent[1];
      }
    }
  }
  return 'UnknownComponent';
}

function log(...args: any) {
  if (import.meta.env.MODE !== 'production') {
    console.log(getTime(), ...args, getCallingComponent());
  } else {
    //! in production log to file!
    return;
  }
}

export default log;
