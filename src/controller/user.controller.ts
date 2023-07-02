import { createUser, authenticateUser } from "../usecase/user.usecase";
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
    // try {
    //     const authDetails = await authenticateUser(body.email, body.password);
    //     if(!authDetails) {
    //         return {
    //             headers: {
    //                 "Content-Type": "application/json"
    //             },
    //             status: 200,
    //             body: JSON.stringify({message: "incorrect email or password"}),
    //         };
    //     }
    //     else {
    //         return {
    //             headers: {
    //                 "Content-Type": "application/json"
    //             },
    //             status: 200,
    //             body: JSON.stringify({userId: authDetails.userId, accessToken: authDetails.accessToken}),
    //             cookies: [{"refreshToken": authDetails.refreshToken}]
    //         };
    //     }
    // }
    // catch(error) {
    //     return {
    //         headers: {
    //             "Content-Type": "application/json"
    //         },
    //         status: 409,
    //         body: JSON.stringify({error: "user already exists"}) 
    //     };
    // }
};
