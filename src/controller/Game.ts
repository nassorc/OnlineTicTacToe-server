import mongoose from "mongoose";
import { saveGame } from "../usecase/game.usecase";

interface PlayerType  {
  userId: string
  username: string
  ready: boolean
  online: boolean
  wins: number
}
interface RoundType {
  playerX: string
  playerO: string
  roundWinner: string
  winningTiles: number[]
  gameBoard: string[]
}
class Game {
  gameId: string;
  userA: PlayerType;
  userB: PlayerType;
  gameWinner: string
  maxWins: number;
  rounds: RoundType[];
  currentRound: number;
  isGameSaved: boolean;

  constructor(userAId: string, userAUsername: string, userBId: string, userBUsername: string, maxWins = 3) {
    this.isGameSaved = false;
    this.gameId = this.generateGameId();
    this.userA = {
      userId: userAId,
      username: userAUsername,
      ready: false, 
      online: false,
      wins: 0,
    }
    this.userB = {
      userId: userBId,
      username: userBUsername,
      ready: false, 
      online: false,
      wins: 0,
    }
    this.maxWins = maxWins;
    this.gameWinner = ""
    this.currentRound = 0;
    this.rounds = [];
    this.addNewRound();
    return;
  }

  generateGameId() {
    const objectId = new mongoose.Types.ObjectId();
    return objectId.toString();
  }

  playerReady(playerId: string) {
    let updated = false;
    if(playerId == this.userA.userId)  {
      this.userA.ready = true;
      updated = true;
    } 
    else if (playerId == this.userB.userId){
      this.userB.ready = true;
      updated = true;
    }
    if(! updated) throw new Error("user is not a player of the game");
  }

  playerNotReady(playerId: string) {
    let updated = false;
    if(playerId === this.userA.userId)  {
      this.userA.ready = false;
      updated = true;
    } 
    else if (playerId === this.userB.userId){
      this.userB.ready = false;
      updated = true;
    }
    if(! updated) throw new Error("user is not a player of the game");
  }

  addNewBoard(board: string) {
    const round = this.rounds[this.currentRound];
    round.gameBoard.push(board);
    return;
  }

  addNewRound() {
    const userAWins = this.userA.wins;
    const userBWins = this.userB.wins;
    if(userAWins === this.maxWins || userBWins === this.maxWins) return;
    const emptyBoard = "NNNNNNNNN";
    const round = {
      playerX: "",
      playerO: "",
      roundWinner: "",
      winningTiles: [],
      gameBoard: [emptyBoard],
    }
    // determine player x and o
    const num = this.random(0, 2);  
    if(num) {
      round.playerX = this.userA.userId
      round.playerO = this.userB.userId
    }
    else {
      round.playerX = this.userB.userId
      round.playerO = this.userA.userId
    }

    this.rounds.push(round);
    return;
  }

  /**
   * Returns player x of current round
   */
  getPlayerX() {
    return this.rounds[this.rounds.length - 1].playerX;
  }
  /**
   * Returns player O of the current round
   */
  getPlayerO() {
    return this.rounds[this.rounds.length - 1].playerO;
  }
  getGameWinner() {
    return this.gameWinner;
  }
  async saveGame(value: boolean) {
    if(!this.isGameSaved) {
      await saveGame(this.serializeForDB());
    }
    this.isGameSaved = true;
  }
  declareRoundWinner(move: string, tiles: number[]) {
    if(move.toUpperCase() === "X") {
      // extract playerX id
      const playerX = this.rounds[this.rounds.length - 1].playerX;
      // assign playerX to roundWinner
      this.rounds[this.rounds.length - 1].roundWinner = playerX;
      // update user's win count
      if(this.userA.userId === playerX) ++this.userA.wins
      else ++this.userB.wins
    }
    else if(move.toUpperCase() === "O") {
      // extract playerX id
      const playerO = this.rounds[this.rounds.length - 1].playerO;
      // assign playerX to roundWinner
      this.rounds[this.rounds.length - 1].roundWinner = playerO;
      // update user's win count
      if(this.userA.userId === playerO) ++this.userA.wins
      else ++this.userB.wins
    }
    // set the winning tile set
    this.rounds[this.rounds.length - 1].winningTiles = tiles;

    // check for game winner, or increment round counter and add new round
    if(this.userA.wins === this.maxWins) {
      console.log("USER A WINS THE GAME");
      this.gameWinner = this.userA.userId
    }
    else if(this.userB.wins === this.maxWins) {
      console.log("USER B WINS THE GAME");
      this.gameWinner = this.userB.userId
    }
    else {
      this.incrementRoundCounter();
      this.addNewRound();
    }
    return;
  }

  incrementRoundCounter() {
    // check if any player reached max wins
    const userA = this.userA;
    const userB= this.userB;
    if(userA.wins === this.maxWins) {
      this.gameWinner = userA.userId;
    }
    else if(userB.wins === this.maxWins) {
      this.gameWinner = userB.userId;
    }
    else {
      this.currentRound += 1;
    }
    return this.currentRound;
  }

  serializedGameForEvent() {
    return {
      roomId: this.gameId,
      userA: this.userA,
      userB: this.userB,
      maxWins: this.maxWins,
      gameWinner: this.gameWinner, 
      rounds: this.rounds,
    }
  }

  serializeForDB() {
    return {
      _id: this.gameId,
      userA: this.userA,
      userB: this.userB,
      maxWins: this.maxWins,
      gameWinner: this.gameWinner,
      rounds: this.rounds
    }
  }

  random(lower, upper) {
    return Math.floor(Math.random() * upper) + lower;
  }
};
export default Game;