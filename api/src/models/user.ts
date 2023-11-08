import mongoose, {Schema, Document} from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

interface IUser extends Document {
  email: string;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
