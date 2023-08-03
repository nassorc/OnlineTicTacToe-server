import {Server} from "socket.io";
import { 
  onAcceptInvitation, 
  onInvitePlayer, 
  onPlayerMove, 
  onRejectInvitation, 
  onUserAddFriend, 
  onUserConnected,
  onUserDisconnecting,
  socketHandler,
} from "./controller/socket.controller";
import socketAttachUser from "./middleware/socketAttachUser";
import { setOnlineStatus } from "./usecase/user.usecase";

export default function socket(server: any) {
  const io = new Server(server, {
      cors: {
          origin: "http://localhost:5173",
          methods: ["GET", "POST"],
          credentials: true,
      }
  });

  // middleware attaches user information on socket
  io.use(socketAttachUser);

  io.on("connection", (socket: any) => {
    // join user in friend's room
    // allows for real time notification, specfically from friends
    socket.join(socket.userId);
    socket.join(socket.roomKey);

    (async function() {
      await setOnlineStatus(socket.userId, true);
    })();

    // join room with friend's id
    for(let friendId of socket.friends) {
      socket.join(friendId);
    }

    socket.on("user:addFriend", socketHandler(socket, onUserAddFriend))
    socket.to(socket.roomKey).emit("friend:connected", socket.userId);
    socket.on("user:invitePlayer", socketHandler(socket, onInvitePlayer));
    socket.on("user:acceptInvitation", socketHandler(socket, onAcceptInvitation));
    socket.on("user:rejectInvitation", socketHandler(socket, onRejectInvitation));
    socket.on("game:connected", socketHandler(socket, onUserConnected));
    socket.on("game:playerMove", socketHandler(socket, onPlayerMove));
    socket.on("disconnecting", onUserDisconnecting(socket));
    
    socket.emit("notification:gameInvite", "notification from server")
  });
}