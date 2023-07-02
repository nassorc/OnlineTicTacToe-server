import jwt from "jsonwebtoken";
import UserModel from "../model/User";

export const createUser = async (userDetails: any) => {
    try {
        const user = await UserModel.create(userDetails);
        return user;
    }
    catch(error: any) {
        throw error;
    }
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