import {NextFunction, Request, Response} from "express";
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
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {status, body, headers, cookies} = await controller(req);
        if(headers) {
          res.set(headers);
        }
        if(cookies) {
          cookies.forEach((cookie: any) => {
            res.cookie(cookie.type, cookie.value, {
              httpOnly: cookie.httpOnly,
              maxAge: 1000 * 60 * 60 * 24,
            })
          })
        }
        res.status(status);
        res.type("json")
        res.send(body);
      }
      catch(error: any) {
        next(error)
      }
    }
}

export default controllerHandler;