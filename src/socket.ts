import {Server} from "socket.io";
import { 
  onAcceptInvitation, 
  onInvitePlayer, 
  onPlayerMove, 
  onRejectInvitation, 
  onUserConnected,
  onPlayerWins,
  onUserDisconnect
} from "./controller/socket.controller";
import socketAttachUser from "./middleware/socketAttachUser";
import { setOnlineStatus } from "./usecase/user.usecase";

export interface gameStatusType {
  roomId: string,
  game: gameHistoryType,
  [key: string]: any,
}
export interface gameHistoryType {
  roomId: string,
  playerX: string,
  playerO: string,
  round: number,
  history: Array<Array<string>>,
  currentPlayer: string,
}
const gameStatus: gameStatusType[] = []

export interface gameType {
  roomId: string,
  userA: {
    userId: string,
    ready: boolean,
  },
  userB: {
    userId: string,
    ready: boolean,
  },
  playerX: string,
  playerO: string,
  round: number,
  history: Array<Array<string>>
  currentPlayer: string,
}

const games: gameType[] = []

export default function socket(server: any) {
  const io = new Server(server, {
      cors: {
          origin: "http://localhost:5173",
          methods: ["GET", "POST"],
          credentials: true,
      }
  });

  io.use(socketAttachUser);

  io.on("connection", (socket: any) => {
    socket.join(socket.userId);
    (async function() {
      await setOnlineStatus(socket.userId, true);
    })();
    socket.on("user:invitePlayer", onInvitePlayer(socket));
    socket.on("user:acceptInvitation", onAcceptInvitation(socket, games));
    socket.on("user:rejectInvitation", onRejectInvitation(socket, games));
    socket.on("game:connected", onUserConnected(socket, games));
    socket.on("game:playerMove", onPlayerMove(socket, games));
    socket.on("game:winner", onPlayerWins);
    socket.on("disconnect", onUserDisconnect(socket));
  });
}