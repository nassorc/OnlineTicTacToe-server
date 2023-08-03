import {Express} from "express";
import controllerHandler from "./middleware/controllerHandler";
import { acceptFriendRequestHandler, addFriendHandler, authenticateUserHandler, createUserHandler, fuzzySearchUserHandler, getFriendsHandler, getUserByUsernameHandler, getUserHandler, rejectFriendRequestHandler } from "./controller/user.controller";
import verifyUser from "./middleware/verifyUser";
import { incrementPlayerGameWins, addGameRound } from "./usecase/game.usecase";

export default function(app: Express) {
  app.post("/api/signin", controllerHandler(authenticateUserHandler));
  app.get("/api/user/:id", verifyUser, controllerHandler(getUserHandler));
  app.post("/api/user", controllerHandler(createUserHandler));
  app.get("/api/user/username/:username", verifyUser, controllerHandler(getUserByUsernameHandler));
  app.get("/api/users/username/:username", verifyUser, controllerHandler(fuzzySearchUserHandler));
  app.get("/api/friends", verifyUser, controllerHandler(getFriendsHandler))
  app.post("/api/friend/add/:id", verifyUser, controllerHandler(addFriendHandler));
  app.post('/api/friend/accept/:id', verifyUser, controllerHandler(acceptFriendRequestHandler));
  app.post('/api/friend/reject/:id', verifyUser, controllerHandler(rejectFriendRequestHandler));
  app.post('/api/test', async (req, res) => {
    // await incrementPlayerGameWins("64aa553941deaa293ca2ec49", "64a3b8ddac9c82a887932c2b");
    await addGameRound("64a60b1f77d9e6a16d183689", "64a3b8ddac9c82a887932c2b");
    res.sendStatus(200);
  })
}