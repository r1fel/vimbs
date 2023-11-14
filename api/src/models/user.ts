import mongoose, {Schema} from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';
import {UserInDB} from '../typeDefinitions';

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', UserSchema);
// const User = mongoose.model<UserInDB>('User', UserSchema);

export default User;
