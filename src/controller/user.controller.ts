import { createUser, authenticateUser, getFriends, addFriend, acceptFriendRequest, fuzzySearchUser, findUserbyId, rejectFriendRequest } from "../usecase/user.usecase";
interface requestObjectType {
    body: any,
    params: any,
}

export const createUserHandler = async ({body}: {body: any}) => {
    try {
        const user = await createUser(body);
        return {
            headers: {
                "Content-Type": "application/json"
            },
            status: 200,
            body: JSON.stringify(user) 
        };
    }
    catch(error: any) {
        return {
            headers: {
                "Content-Type": "application/json"
            },
            status: 409,
            body: JSON.stringify({error: "user already exists"}) 
        };
    }
}; 

export const authenticateUserHandler = async ({body}: {body: any}) => {
    try {
        const auth = await authenticateUser(body.email, body.password);
        return {
            headers: {
                "Content-Type": "application/json"
            },
            status: 200,
            body: JSON.stringify({user: {userId: auth.userId, username: auth.username, email: auth.email, accessToken: auth.accessToken}}),
            cookies: [{type: "refreshToken", value: auth.refreshToken, httpOnly: true}, {type: "accessToken", value: auth.accessToken, httpOnly: false}]
        };
    }
    catch(error: any) {
        return {
            headers: {
                "Content-Type": "application/json"
            },
            status: 401,
            body: JSON.stringify({error: error.message}) 
        };
    }
};

export const getUserHandler = async (requestObject: any) => {
    const id = requestObject.params.id;
    const user = await findUserbyId(id);
    return createResponse(200, user);
};

function createResponse(status: number, body: any, headers: any = {'Content-Type': 'application/json'}, cookies: any | undefined = undefined) {
  return {
    status,
    headers,
    body,
    cookies
  }
}

export const getFriendsHandler = async (requestObject: any) => {
  const currentUserId = requestObject.local.userId;
  const friends = await getFriends(currentUserId);
  return createResponse(200, {friends});
}

export const addFriendHandler = async (requestObject: any) => {
  const currentUserId = requestObject.local.userId;
  const friendId = requestObject.params.id;
  const res = await addFriend(currentUserId, friendId);
  // if(!id) return res.status(400).send("Missing friend id");
  // if(!friend) return res.status(400).send("User not found");
  // if(alreadyFriend) return res.status(409).send("User is already a friend");
  if(res) {
    return createResponse(201, "Successfully sent friend request");
  }
  else {
    return createResponse(400, "Something went wrong. Could not add friend");
  }
}

export const acceptFriendRequestHandler = async (requestObject: any) => {
  const currentUserId = requestObject.local.userId;
  const friendId = requestObject.params.id;
  const res = await acceptFriendRequest(currentUserId, friendId);
  if(res) {
    return createResponse(201, "Successfully accepted friend request");
  }
  else {
    return createResponse(400, "Something went wrong. Could not add friend");
  }
}

export const rejectFriendRequestHandler = async (requestObject: any) => {
  const currentUserId = requestObject.local.userId;
  const friendId = requestObject.params.id;
  const res = await rejectFriendRequest(currentUserId, friendId);
  if(res) {
    return createResponse(201, "Successfully rejected friend request");
  }
  else {
    return createResponse(400, "Something went wrong. Could not add friend");
  }
}

export const fuzzySearchUserHandler = async(requestObject: any) => {
  const username = requestObject.params.username;
  const users = await fuzzySearchUser(username);
  return createResponse(200, users);
}
