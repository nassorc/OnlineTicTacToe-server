"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setOnlineStatus = exports.authenticateUser = exports.findUserByUsername = exports.findUserbyEmail = exports.createUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../model/User"));
const createUser = (userDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.create(userDetails);
        return user;
    }
    catch (error) {
        throw error;
    }
});
exports.createUser = createUser;
const findUserbyEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findOne({ email });
    return user;
});
exports.findUserbyEmail = findUserbyEmail;
const findUserByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.find({ username }, "-password -createdAt -updatedAt -__v");
    return user;
});
exports.findUserByUsername = findUserByUsername;
const authenticateUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findOne({ email }, "-__v -sessionId -isSessionValid -createdAt -updatedAt");
    if (!user)
        throw new Error("Email or password is incorrect");
    if (user.password != password)
        throw new Error("Email or password is incorrect");
    (0, exports.setOnlineStatus)(user._id, true);
    const payload = {
        _id: user._id,
        username: user.username,
        email: user.email,
    };
    const accessToken = jsonwebtoken_1.default.sign(payload, process.env.SECRET_KEY, { expiresIn: "2h" });
    const refreshToken = jsonwebtoken_1.default.sign(payload, process.env.SECRET_KEY, { expiresIn: "1y" });
    return {
        userId: user._id,
        username: user.username,
        email: user.email,
        accessToken,
        refreshToken
    };
});
exports.authenticateUser = authenticateUser;
const setOnlineStatus = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    yield User_1.default.findByIdAndUpdate(id, { $set: { online: status } });
    return true;
});
exports.setOnlineStatus = setOnlineStatus;
