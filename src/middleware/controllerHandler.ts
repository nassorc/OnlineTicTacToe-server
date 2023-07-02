import {Request, Response} from "express";

interface RequestType extends Request {
    locals?: string,
}
interface ControllerResponseType {
    headers: {
        "Content-Type"?: any,
    },
    body: any,
    status: number,
    cookies?: any,
}
type ControllerFnType = (req: Request) => Promise<ControllerResponseType>;
function controllerHandler(controller: ControllerFnType) {
    return async (req: Request, res: Response) => {
        try {
            const ControllerResponse: ControllerResponseType = await controller(req);
            if(ControllerResponse.headers) {
                res.set(ControllerResponse.headers);
            }
            if(ControllerResponse.cookies && ControllerResponse.cookies.length > 0) {
                ControllerResponse.cookies.forEach((cookie: any) => {
                    console.log(cookie);
                    res.cookie(cookie.type, cookie.value, {
                        httpOnly: cookie.httpOnly,
                    })
                })
            }
            // res.cookie("name", "123");
            res.status(ControllerResponse.status);
            res.type("json")
            res.send(ControllerResponse.body);
        }
        catch(error: any) {
            console.log(error.message);
            res.status(500).json("Server error");
        }
    }
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

export default controllerHandler;