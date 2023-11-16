export interface IMongoDBUser {
  googleId?: string;
  username: string;
  hash: string;
  salt: string;
  __v: number;
  _id: string;
}
