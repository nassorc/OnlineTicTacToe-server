import jwt from "jsonwebtoken";
import UserModel from "../model/User";
import { createGame } from "./game.usecase";
import mongoose, { Types } from "mongoose";
import Fuse from 'fuse.js';

export const createUser = async (userDetails: any) => {
    try {
        const user = await UserModel.create(userDetails);
        return user;
    }
    catch(error: any) {
        throw error;
    }
};

export function generateGameId() {
  return (new Types.ObjectId()).toString();
}

export const invitePlayer = async (userId: string, username: string, playerId: string) => {
  const roomId = generateGameId();

  const player = await UserModel.findById(playerId, "-sessionId -isSessionValid -email -password -createdAt -updatedAt -__v");
  if(!player) throw new Error("Cannot invite player that does not exist");

  // create room to ensure the creation.
  const game = await createGame(roomId, userId, playerId, 3);
  if(!game) throw new Error("Could not create game room. Try again later.")
  const invitation = {
    roomId,
    to: {
      userId: player._id,
      username: player.username
    },
    from: {
      userId: userId,
      username: username,
    },
  }
  return invitation;

}

export const findUserbyId = async (id: string) => {
    const user = await UserModel
      .findById(id, "-__v -password -sessionId -isSessionValid -playing -createdAt -updatedAt")
      .populate("friends", "-__v -password -sessionId -isSessionValid -totalWins -allGames -friends -createdAt -updatedAt")
      .populate("friendInvites.sender", "-__v -password -sessionId -isSessionValid -totalWins -allGames -friends -createdAt -updatedAt");
    if(!user) new Error("User does not exists");
    return user;
}; 

export const findUserbyEmail = async (email: string) => {
    const user = await UserModel.findOne({email});
    return user;
}; 

export const findUserByUsername = async (username: string) => {
    const user = await UserModel.find({username}, "-password -createdAt -updatedAt -__v");
    return user;
};

export const authenticateUser = async (email: string, password: string) => {
    const user = await UserModel.findOne({email}, "-__v -sessionId -isSessionValid -createdAt -updatedAt");
    if(!user) throw new Error("Email or password is incorrect");
    if(user.password != password) throw new Error("Email or password is incorrect"); 
    setOnlineStatus(user._id, true);
    const payload = {
        _id: user._id,
        username:  user.username,
        email: user.email,
        
    }
    const accessToken = jwt.sign(payload, process.env.SECRET_KEY as string, { expiresIn: "2h" });
    const refreshToken = jwt.sign(payload, process.env.SECRET_KEY as string, { expiresIn: "1y" });

    return {
        userId: user._id,
        username: user.username,
        email: user.email,
        accessToken,
        refreshToken
    };
};

export const getFriends = async (id: string) => {
  const user = await UserModel.findById(id).populate("friends", "-__v -password -sessionId -isSessionValid -totalWins -allGames -friends -createdAt -updatedAt");
  if(!user) throw new Error('Could not get friends of user that does not exist');
  return user?.friends;
}

export const addFriend = async(currentUserId: string, friendId: string) => {
  // check if user alreay made request
  const friendRequestExists = await UserModel.findOne({_id: friendId, "friendInvites.sender": currentUserId });
  if(friendRequestExists) {
    console.log("REQUEST ALREADY EXISTS", friendRequestExists)
    return
  }
  const friend = await UserModel.findByIdAndUpdate(friendId, 
    {$push: { friendInvites: {sender: currentUserId}}}
  )
  console.log("USEVASE::::", friend)
  if(!friend) throw new Error('Could not add User as friend. User does not exist');
  const alreadyFriend = friend.friends.includes(currentUserId);
  if(alreadyFriend) throw new Error('User is already current user\'s friend');
  return friend;
}
export const rejectFriendRequest = async (currentUserId: string, friendId: string) => {
  const currentUser = await UserModel.findByIdAndUpdate(currentUserId, {$pull: {"friendInvites.sender": friendId}});
  if(!currentUser) throw new Error('Could not find user');
  return true;
}

export const acceptFriendRequest = async (currentUserId: string, friendId: string) => {
  const session = await UserModel.startSession();
  session.startTransaction();
  try {
    const currentUser = await UserModel.findByIdAndUpdate(currentUserId, 
      { $addToSet: { friends: friendId}},
      { new: true, session: session},
    )
    if(!currentUser) throw new Error('Either current user or user that is being added does not exist');

    const friend = await UserModel.findByIdAndUpdate(friendId, 
      { $addToSet: { friends: currentUserId}},
      { new: true, session: session},
    )

    if(!friend) throw new Error('Either current user or user that is being added does not exist');

    // delete friend request if both users are now friends
    const deleteRes = await UserModel.findByIdAndUpdate(currentUser,
      {$pull: { friendInvites: { sender: friendId}}},
      { new: true, session: session}
    )

    if(!deleteRes) throw new Error('Could not accept friend request please try again later');;

    // commit transaction
    await session.commitTransaction();
    await session.endSession();
    return true;

  }
  catch(error: any) {
    await session.abortTransaction();
    session.endSession();
    throw error;

  }

}

export const fuzzySearchUser = async (username: string) => {
  console.log("FUZZIED SEARCHED")
  const users = await UserModel.find({username: { $regex: new RegExp(`${username}`, "i")}}, "-password -createdAt -updatedAt -__v -sessionId -isSessionValid")
  const fuse = new Fuse(users, {
    keys: ['username'],
    threshold: 0.9,
  })
  const fusedUsers = fuse.search(username);
  return fusedUsers.map(user => user.item);
}

export const setOnlineStatus = async (id: string | mongoose.Types.ObjectId, status: boolean) => {
  await UserModel.findByIdAndUpdate(id, { $set: { online: status}});
  return true;
}