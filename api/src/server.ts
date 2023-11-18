import app from './app';

// general configurations
app.listen(process.env.PORT, () => {
  console.log(`Serving on port ${process.env.PORT}`);
});
