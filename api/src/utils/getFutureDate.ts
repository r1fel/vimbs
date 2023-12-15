// function that takes an amount of weeks and generates the date from now + given amount of weeks

const getFutureDate = (weeks = 2): Date => {
  const currentDate = new Date();
  const futureDate = new Date(
    currentDate.getTime() + weeks * 7 * 24 * 60 * 60 * 1000,
  ); // Adding milliseconds for the wished number of weeks

  return futureDate;
};

export default getFutureDate;
