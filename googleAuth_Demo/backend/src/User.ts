import mongoose from 'mongoose';
import { IMongoDBUser } from './types';
import passportLocalMongoose from 'passport-local-mongoose';

const user = new mongoose.Schema({
  googleId: {
    required: false,
    type: String,
  },
});
user.plugin(passportLocalMongoose);

export default mongoose.model('User', user);
