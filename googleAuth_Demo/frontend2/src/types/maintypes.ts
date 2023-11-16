// this is in principle the same as the UserInDB type
// defined at the api - to do in the future would be
// to just send a required partial of the user data
// to be stored in the context and to send the rest
// of the user data, when necessary for settings etc

export interface IUser {
  _id: string;
  email: string;
  googleId?: string;
  profilePicture?: string;
  creationDate: Date;
  firstName?: string;
  lastName?: string;
  __v: number;
}
