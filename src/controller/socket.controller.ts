import UserModel from "../model/User";
import { createFriendRequest, setOnlineStatus } from "../usecase/user.usecase";
import checkWinner from "../utils/checkWinner";
import {config} from "../config";
import Game from "./Game";
import { addFriendHandler } from "./user.controller";

export function socketHandler(socket, controller) {
  return async (message) => {
    try {
      const payload = {
        message: message,
        roomId: socket.roomId,
        user: {
          userId: socket.userId,
          username: socket.username,
          email: socket.email,
        },
        socketId: socket.id,
      }
      await controller(socket, payload);
    } catch(error: any) {
      error && socket.emit("application:error", error.message);
    }
  }
}

let games = [];

export async function onUserAddFriend(socket: any, payload: any) {
  const friendId = payload.message.friendId;
  const userId = payload.user.userId;
  const username = payload.user.username;
  // save data
  const friend = await createFriendRequest(userId, friendId);
  const invitation = {
    sender: {
      _id: userId,
      username: username
    },
    to: {
      _id: friend._id,
      username: friend.username
    }
  }
  // emit to receiver
  socket.to(payload.message.friendId).emit("user:receiveFriendRequest", invitation)
}
let invitations = [];
export async function onInvitePlayer(socket: any, payload: any) {
  // extract data
  const playerId = payload.message.playerId;
  const userId = payload.user.userId;
  const username = payload.user.username;

  const player = await UserModel.findById(playerId, { _id: true, username: true});
  if(!player) throw new Error("Player does not exist");

  const newGame = new Game(userId, username , playerId, player.username, Number(config.GAME.MAX_GAMES));
  games.push(newGame);

  const invitation = {
    roomId: newGame.gameId,
    to: {
        userId: playerId,
        username: player.username,
    },
    from: {
        userId: userId,
        username: payload.user.username 
    }
  }

  invitations.push(invitation);

  socket.to(playerId).emit("user:invited", invitation);
  socket.join(newGame.gameId);
}

export async function onAcceptInvitation(socket: any, payload: any) {
  const roomKey = payload.message.roomId;
  const invitation = invitations.find(i => i.roomId === roomKey);
  const roomId = invitation.roomId;

  // TODO: notify user when invitation was cancelled by the sender
  if(!invitation) return;

  // add roomId to socket object
  socket.roomId = roomId;
  // join room user to room
  socket.join(roomId);

  // inform other player that ther user accepted the game invite
  socket.broadcast.to(roomId).emit("user:acceptsInvitation", {
    roomId: roomId,
  });
}

export async function onRejectInvitation(socket: any, payload: any) {
  const playerId = payload.message.playerId;
  const roomId = payload.message.roomId;
  // inform user of invite rejection
  // socket.broadcast.to(playerId).emit("user:rejectsInvitation", deleted);
  socket.leave(playerId);
}

export async function onUserConnected(socket: any, payload: any) {
  const roomId = payload.message.roomId;
  const userId = payload.user.userId || payload.message.userId;
  socket.join(roomId);

  const game = games.find(game => game.gameId === roomId);
  if(!game) throw new Error("Game does not exist");

  game.playerReady(userId);
  const gameInfo  = game.serializedGameForEvent();

  if(game?.userA.ready && game?.userB.ready) {
    // const round = game.rounds[game.rounds.length - 1];
    socket.emit('game:start', gameInfo);
    socket.to(roomId).emit('game:start', gameInfo);
  }
}

// last: created a mongodb transaction, now broken code
export async function onPlayerMove(socket: any, payload: any) {
  // get roomId
  const roomId = payload.message.roomId;
  const roundId = payload.message.roundId;
  const board = payload.message.board;

  const game = games.find(game => game.gameId === roomId);
  if(!game) throw new Error("Game does not exist");

  // update board information
  game.addNewBoard(board);
  // check winner
  let hasWinner =  checkWinner(board.split(""));

  if(hasWinner.winner) {
    game.declareRoundWinner(hasWinner.winner, hasWinner.tiles);
    // socket.emit("game:winner", hasWinner);
    // socket.to(roomId).emit("game:winner", hasWinner);
    if(game.gameWinner) {
      game.saveGame()
    }
  }
  
  socket.emit("game:playerMove", game.serializedGameForEvent());
  socket.to(roomId).emit("game:playerMove", game.serializedGameForEvent());
}


export function onUserDisconnecting(socket: any) {
  return async () => {
    // TODO: Implement saving game when a user disconnects mid game
    // TODO: Inform other player, add abort feature. Giving win to the user who didn't dc
    await setOnlineStatus(socket.userId, false);
    socket.to(socket.roomKey).emit("friend:disconnected", socket.userId);
  }
}