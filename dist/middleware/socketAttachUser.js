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
const User_1 = __importDefault(require("../model/User"));
function socketAttachUser(socket, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cookies = (_a = socket.request.headers.cookie) === null || _a === void 0 ? void 0 : _a.split("; ");
            const userId = socket.handshake.auth.userId;
            if (!userId)
                return next(new Error("Socket requires userId"));
            const user = yield User_1.default.findById(userId, "-password -createdAt -updatedAt -__v");
            if (!user)
                return next(new Error("User does not exist"));
            socket.userId = user._id.toString();
            socket.username = user.username;
            socket.email = user.email;
            return next();
        }
        catch (error) {
            return next(new Error(error.message));
        }
    });
}
exports.default = socketAttachUser;
