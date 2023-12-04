function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: number;

  return function (this: any, ...args: any[]) {
    const context = this;

    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

export default debounce;

// function debounce(func, wait) {
//   let timeout;
//   return function (...args) {
//     const context = this;
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func.apply(context, args), wait);
//   };
// }
// export default debounce;
