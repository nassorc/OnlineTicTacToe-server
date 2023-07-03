"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    // username: {type: String, required: true, unique: true},
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    sessionId: { type: String, default: "" },
    isSessionValid: { type: Boolean, default: false },
    online: { type: Boolean, default: false },
}, {
    timestamps: true,
});
UserSchema.index({ username: 'text' });
const UserModel = mongoose_1.default.model("users", UserSchema);
exports.default = UserModel;
