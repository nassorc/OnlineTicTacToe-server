import UserModel from "../model/User";
export default async function socketAttachUser(socket: any, next: any) {
  try {
    const cookies = socket.request.headers.cookie?.split("; ");
    const userId = socket.handshake.auth.userId || socket.handshake.headers.userId|| socket.handshake.headers.userid ;
    if(!userId) return next(new Error("Socket requires userId"));
    const user = await UserModel
      .findById(userId, "-password -createdAt -updatedAt -__v")
      .populate("friends", {roomKey: true});
    if(!user) return next(new Error("User does not exist"));

    socket.userId = user._id.toString();
    socket.username = user.username;
    socket.email = user.email;
    socket.roomKey = user.roomKey;
    socket.friends = user.friends.map(friend => (friend as any).roomKey);

    return next();
  }
  catch(error: any) {
    return next(new Error(error.message));
  }
}