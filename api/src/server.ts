import * as database from './database';
import makeApp from './app';

// creating app by handing the database setup to it with dependency injection
// instead of letting it always grab the same db
const app = makeApp(database);

// general configurations
app.listen(process.env.PORT, () => {
  console.log(`Serving on port ${process.env.PORT}`);
});
