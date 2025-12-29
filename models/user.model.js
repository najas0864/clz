import { model, Schema } from "mongoose";

const UserSchema = new Schema({
    otp:{type:Number,default: null},
    email: {type:String,require:true,},
    password: {type:String,require:true,},
    role: {type: String,enum: ['student', 'teacher'],required: true,},
},{timestamps:true});

const User = model('User', UserSchema);

export default User;