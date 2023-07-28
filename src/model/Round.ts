import mongoose from 'mongoose';

const RoundSchema = new mongoose.Schema({
  playerX: {type: String, ref: 'users', default: ""},
  playerO: {type: String, ref: 'users', default: ""},
  roundWinner: {type: String, ref: 'users', default: ""},
  winningTiles: {type: [Number], default: []},
  gameBoard: {type: [String], default: ["NNNNNNNNN"]}
})

const RoundModel = mongoose.model('round', RoundSchema);
export {
  RoundSchema
}
export default RoundModel;