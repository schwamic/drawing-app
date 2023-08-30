// By tarun007
// Link: https://www.geeksforgeeks.org/javascript-throttling/

export const throttle = (callback: (args: any) => void, delay: number) => {
  let prev = 0;
  return (...args) => {
    const now = new Date().getTime();
    if (now - prev > delay) {
      prev = now;
      return callback(...args);
    }
  };
};
