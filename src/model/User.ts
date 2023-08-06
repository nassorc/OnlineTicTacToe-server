import mongoose, { Types } from "mongoose";

const FriendInviteSchema = new mongoose.Schema({
  sender: {type: String, requires: true, ref: 'users'},
  status: {type: String, default: 'unread'},
  }, 
  {timestamps: true}
)

/**
 * roomKey: Key is shared with friends to join a common socket room.
 *          This is for realtime notifications between a user and a friend.
 *          Don't use _id for users to share a common room. Sending game invites
 *          will be sent to all friends in the same room instead of the user.
 */
const UserSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  sessionId: {type: String, default: ""},
  isSessionValid: {type: Boolean, default: false},
  roomKey: {type: String, unique: true, default: new Types.ObjectId()},
  online: {type: Boolean, default: false},
  playing: {type: Boolean, default: false},
  totalWins: {type: Number, default: 0},
  allGames: {type: [ String ], ref: 'games', default: []},
  friends: {type: [ String ], ref: 'users', default: []},
  friendInvites: {type: [FriendInviteSchema], default: []},
  profileImage: {type: String, default: ""}
}, {
    timestamps: true,
});

UserSchema.index({username: 'text'});

const UserModel = mongoose.model("users", UserSchema);

export default UserModel;