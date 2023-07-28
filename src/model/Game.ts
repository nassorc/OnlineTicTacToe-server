import mongoose from 'mongoose';
import {RoundSchema} from './Round';
import generateRoundObject from '../utils/generateRoundObject';

const userSchema = new mongoose.Schema({
  userId: { type: String, ref: "users" },
  username: {type: String},
  ready: { type: Boolean, default: false },
  online: { type: Boolean, default: false },
  wins: { type: Number, default: 0}
})

const GameSchema = new mongoose.Schema({
  userA: { type: userSchema, required: true },
  userB: { type: userSchema, required: true},
  maxWins: { type: Number, required: true},
  gameWinner: { type: String, default: ""},
  rounds: { type: [RoundSchema], default: []},
  currentRound: { type: Number, default: 0}
});

GameSchema.pre("save", function (next) {
  let userA = this.userA.userId;
  let userB = this.userB.userId;
  const round = generateRoundObject(userA, userB);
  this.rounds.push(round);
  next();
})

const GameModel = mongoose.model('game', GameSchema);

export default GameModel;