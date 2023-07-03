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
function controllerHandler(controller) {
    return (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const ControllerResponse = yield controller(req);
            if (ControllerResponse.headers) {
                res.set(ControllerResponse.headers);
            }
            if (ControllerResponse.cookies && ControllerResponse.cookies.length > 0) {
                ControllerResponse.cookies.forEach((cookie) => {
                    console.log(cookie);
                    res.cookie(cookie.type, cookie.value, {
                        httpOnly: cookie.httpOnly,
                    });
                });
            }
            // res.cookie("name", "123");
            res.status(ControllerResponse.status);
            res.type("json");
            res.send(ControllerResponse.body);
        }
        catch (error) {
            console.log(error.message);
            res.status(500).json("Server error");
        }
    });
}
// function controllerHandler(controller) {
//     return async (req: RequestType, res: Response) => {
//         const requestObject = {
//             body: req.body,
//             query: req.query,
//             params: req.params,
//             locals: req.locals,
//         };
//         try {
//             const responseObject = await controller(requestObject);
//             if(responseObject.headers) {
//                 res.set(responseObject.headers);
//             }
//             if(responseObject?.cookies) {
//                 responseObject?.cookies.forEach(cookie => {
//                     res.cookie(Object.keys(cookie)[0], Object.values(cookie)[0]);
//                 });
//             }
//             res.type("json");
//             res.status(responseObject.status as number);
//             res.send(responseObject.body);
//         }
//         catch(error: any) {
//             res.status(500).send({error: error.message});
//         }
//         // after controller returns
//     };
// }
exports.default = controllerHandler;
