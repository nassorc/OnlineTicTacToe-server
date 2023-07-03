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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUserHandler = exports.createUserHandler = void 0;
const user_usecase_1 = require("../usecase/user.usecase");
const createUserHandler = ({ body }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, user_usecase_1.createUser)(body);
        return {
            headers: {
                "Content-Type": "application/json"
            },
            status: 200,
            body: JSON.stringify(user)
        };
    }
    catch (error) {
        return {
            headers: {
                "Content-Type": "application/json"
            },
            status: 409,
            body: JSON.stringify({ error: "user already exists" })
        };
    }
});
exports.createUserHandler = createUserHandler;
const authenticateUserHandler = ({ body }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const auth = yield (0, user_usecase_1.authenticateUser)(body.email, body.password);
        return {
            headers: {
                "Content-Type": "application/json"
            },
            status: 200,
            body: JSON.stringify({ user: { userId: auth.userId, username: auth.username, email: auth.email, accessToken: auth.accessToken } }),
            cookies: [{ type: "refreshToken", value: auth.refreshToken, httpOnly: true }, { type: "accessToken", value: auth.accessToken, httpOnly: false }]
        };
    }
    catch (error) {
        return {
            headers: {
                "Content-Type": "application/json"
            },
            status: 401,
            body: JSON.stringify({ error: error.message })
        };
    }
    // try {
    //     const authDetails = await authenticateUser(body.email, body.password);
    //     if(!authDetails) {
    //         return {
    //             headers: {
    //                 "Content-Type": "application/json"
    //             },
    //             status: 200,
    //             body: JSON.stringify({message: "incorrect email or password"}),
    //         };
    //     }
    //     else {
    //         return {
    //             headers: {
    //                 "Content-Type": "application/json"
    //             },
    //             status: 200,
    //             body: JSON.stringify({userId: authDetails.userId, accessToken: authDetails.accessToken}),
    //             cookies: [{"refreshToken": authDetails.refreshToken}]
    //         };
    //     }
    // }
    // catch(error) {
    //     return {
    //         headers: {
    //             "Content-Type": "application/json"
    //         },
    //         status: 409,
    //         body: JSON.stringify({error: "user already exists"}) 
    //     };
    // }
});
exports.authenticateUserHandler = authenticateUserHandler;
