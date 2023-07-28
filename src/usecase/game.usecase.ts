import GameModel from "../model/Game";
import mongoose, {Types} from "mongoose";
import generateRoundObject from "../utils/generateRoundObject";
import checkWinner from "../utils/checkWinner";

export async function saveGame(game) {
  console.log(game);
  await GameModel.create({
    _id: new Types.ObjectId(game._id),
    userA: game.userA,
    userB: game.userB,
    maxWins: game.maxWins,
    gameWinner: game.gameWinner,
    rounds: game.rounds,
    currentRound: game.currentRound
  });
}

export async function createGame(roomId: string,userAId: string, userBId: string, maxWins: number) {
  try {
    const game = GameModel.create({
      _id: new Types.ObjectId(roomId),
      userA: {
        userId: userAId
      },
      userB: {
        userId: userBId
      },
      maxWins: maxWins,
    });
    return true;
  } catch(error: any) {
    console.log(error.message);
    return false;
  }
}

export async function rejectGameInvite(roomId: string) {
  const deleted = await GameModel.
    findByIdAndDelete(roomId, { new: true }).
    populate('userA.userId', {_id: true, email: true, password: true}).
    populate('userB.userId', {_id: true, email: true, password: true});
  console.log(deleted);
  if(!deleted) throw new Error("Could not delete game");
  return {
    roomId: deleted._id,
    userA: deleted.userA.userId,
    userB: deleted.userB.userId,
  };
}

export async function playerReady(gameId: string, userId: string) {
  // get game
  try {
    const game = await GameModel.findById(gameId);
    if(!game) throw new Error("Could not find game");
    // determine if userA or userB
    if(game.userA.userId === userId) {
      const data = await GameModel.findByIdAndUpdate(gameId, {$set: { "userA.ready": true }}, { new: true });
      return data;
    }
    else if(game.userB.userId === userId) {
      const data = await GameModel.findByIdAndUpdate(gameId, {$set: { "userB.ready": true }}, { new: true});
      return data;
    }
    return
  } catch(error: any) {
  }
}

export async function playerMove(roomId: string, roundId: string, board: string) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // persist move
    const updatedGame = await addNewBoard(roomId, roundId, board, session);

    // check winner
    const winner = checkWinner(board.split(""));
    const val = winner.winner

    // increment users win counter 
    if(val && val.toLocaleUpperCase() === "X") {
      await declareRoundWinner(roomId, roundId, updatedGame.rounds.slice(-1)[0].playerX, session);
    } 
    else if (val && val.toLocaleUpperCase() === "O") {
      await declareRoundWinner(roomId, roundId, updatedGame.rounds.slice(-1)[0].playerO, session);
    }
    // if user reaches max wins (game winner)
    // determine game winner
    // notify winner and end of game

    // if user wins round, notify winner and wining tiles
    // emit updated board to sender and receiver 
    await session.commitTransaction();
    session.endSession();
    return {
      game: updatedGame,
      winner: winner,
    };
  } catch(error: any) {
    console.log(error.message);
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

export async function addGameRound(userA: string, userB: string) {
  const round = generateRoundObject(userA, userB);
  await GameModel.findByIdAndUpdate("64aa553941deaa293ca2ec49", 
    { $push: { rounds: round }}
  )
}

export async function addNewBoard(gameId: string, roundId: string, board: string, session) {
  return await GameModel
  .findOneAndUpdate(
    { _id: gameId, rounds: { $elemMatch: {_id: new Types.ObjectId(roundId)}} }, 
    { $push: { 'rounds.$.gameBoard': board }}, 
    { new: true, session: session && session});
}

/**
 * Function increments player wins
 * @param gameId ID of the game to retrieve from database.
 * @param playerId ID of player to update win counter
 * @param wins Number to replace user's total number of wins
 */
export async function incrementPlayerGameWins(gameId, playerId) {
  const game = await GameModel.findById(gameId);
  if(game.userA.userId === playerId) {
    game.userA.wins += 1;
  }
  else if (game.userB.userId === playerId) {
    game.userB.wins += 1;
  }
  await game.save();
}

/**
 * Update round winner of a game
 * @param gameId 
 * @returns 
 */
export async function declareRoundWinner(gameId, roundId, playerId, session) {
  const game = await GameModel.findById(gameId, {session: session});
  if(game.userA.userId === playerId) {
    game.userA.wins += 1;
    game.rounds[game.rounds.length - 1].roundWinner = playerId;
  }
  else if (game.userB.userId === playerId) {
    game.userB.wins += 1;
    game.rounds[game.rounds.length - 1].roundWinner = playerId;
  }
  await game.save();

  return
}

/**
 * Update winner of the full game
 * @param gameId 
 */
export async function declareGameWinner(gameId) {
}
