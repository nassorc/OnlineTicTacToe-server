import {Express} from "express";
import controllerHandler from "./middleware/controllerHandler";
import { authenticateUserHandler, createUserHandler } from "./controller/user.controller";
import UserModel from "./model/User";
import verifyUser from "./middleware/verifyUser";
export default function(app: Express) {
  app.get("/", (req, res) => {
    res.send('<h1>hello user</h1>');
  })
    app.get("/healthcheck", (req, res) => {
        res.sendStatus(200);
    });
    app.post("/api/signin", controllerHandler(authenticateUserHandler));
    app.post("/api/user", controllerHandler(createUserHandler));
    app.get("/api/user/:username", verifyUser, async (req, res) => {
        const username = req.params.username;
        const user = await UserModel.find({username: { $regex: new RegExp(`${username}`, "i")}}, "-password -createdAt -updatedAt -__v -sessionId -isSessionValid")
        res.status(200).send(user)
    })
    app.get("/api/find", async (req, res) => {
        const user = await UserModel.find({username: { $regex: /admin/i}})
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
    })
}