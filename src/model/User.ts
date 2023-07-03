import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    // username: {type: String, required: true, unique: true},
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    sessionId: {type: String, default: ""},
    isSessionValid: {type: Boolean, default: false},
    online: {type: Boolean, default: false},
}, {
    timestamps: true,
});

UserSchema.index({username: 'text'});

const UserModel = mongoose.model("users", UserSchema);

export default UserModel;