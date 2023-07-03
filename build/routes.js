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
const controllerHandler_1 = __importDefault(require("./middleware/controllerHandler"));
const user_controller_1 = require("./controller/user.controller");
const User_1 = __importDefault(require("./model/User"));
const verifyUser_1 = __importDefault(require("./middleware/verifyUser"));
function default_1(app) {
    app.get("/healthcheck", (req, res) => {
        res.sendStatus(200);
    });
    app.post("/api/signin", (0, controllerHandler_1.default)(user_controller_1.authenticateUserHandler));
    app.post("/api/user", (0, controllerHandler_1.default)(user_controller_1.createUserHandler));
    app.get("/api/user/:username", verifyUser_1.default, (req, res) => __awaiter(this, void 0, void 0, function* () {
        const username = req.params.username;
        const user = yield User_1.default.find({ username: { $regex: new RegExp(`${username}`, "i") } }, "-password -createdAt -updatedAt -__v -sessionId -isSessionValid");
        res.status(200).send(user);
    }));
    app.get("/api/find", (req, res) => __awaiter(this, void 0, void 0, function* () {
        const user = yield User_1.default.find({ username: { $regex: /admin/i } });
        res.status(200).send(user);
        // const users = await UserModel.find({$find: { $search: '/admin/'}});
        // UserModel.find({$text: { $regex: }})
        //     .limit(10)
        //     .exec()
        //     .then((data) => {
        //         console.log(data)
        //         res.sendStatus(200);
        //     });
        // console.log(users);
    }));
}
exports.default = default_1;
