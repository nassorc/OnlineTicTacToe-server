import UserModel from "../model/User";
export default async function socketAttachUser(socket: any, next: any) {
  try {
    const cookies = socket.request.headers.cookie?.split("; ")
    const userId = socket.handshake.auth.userId;
    if(!userId) return next(new Error("Socket requires userId"));
    const user = await UserModel.findById(userId, "-password -createdAt -updatedAt -__v");
    if(!user) return next(new Error("User does not exist"));

    socket.userId = user._id.toString();
    socket.username = user.username;
    socket.email = user.email;

    return next();
  }
  catch(error: any) {
    return next(new Error(error.message));
  }
}