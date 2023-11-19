import mongoose from 'mongoose';

// setup of the MongoDbAtlas
export function connectToDatabase() {
  const dbURL = `${process.env.DB_URL}vimbs-dev`;
  return mongoose.connect(dbURL);
}

export function closeDatabaseConnection() {
  return mongoose.connection.close();
}
