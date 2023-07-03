"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserDisconnect = exports.onPlayerWins = exports.onPlayerMove = exports.onUserConnected = exports.onRejectInvitation = exports.onAcceptInvitation = exports.onInvitePlayer = void 0;
const User_1 = __importDefault(require("../model/User"));
const crypto_1 = __importDefault(require("crypto"));
const user_usecase_1 = require("../usecase/user.usecase");
function onInvitePlayer(socket) {
    return (playerId) => __awaiter(this, void 0, void 0, function* () {
        const roomId = crypto_1.default.randomBytes(24).toString("hex");
        const player = yield User_1.default.findById(playerId, "-sessionId -isSessionValid -email -password -createdAt -updatedAt -__v");
        if (!player)
            return;
        const payload = {
            roomId,
            to: {
                userId: player._id,
                username: player.username
            },
            from: {
                userId: socket.userId,
                username: socket.username,
            },
        };
        socket.to(playerId).emit("user:invited", payload);
        socket.roomId = roomId;
        socket.join(roomId);
    });
}
exports.onInvitePlayer = onInvitePlayer;
function onAcceptInvitation(socket, games) {
    return ({ playerId, roomId }) => __awaiter(this, void 0, void 0, function* () {
        // add roomId to socket object
        socket.roomId = roomId;
        // join room
        socket.join(roomId);
        // push game details
        games.push({
            roomId: roomId,
            userA: {
                userId: socket.userId,
                ready: false,
            },
            userB: {
                userId: playerId,
                ready: false,
            },
            playerX: "",
            playerO: "",
            round: 0,
            history: [["", "", "", "", "", "", "", "", ""]],
            currentPlayer: ""
        });
        socket.broadcast.to(roomId).emit("user:acceptsInvitation", {
            roomId: roomId,
        });
    });
}
exports.onAcceptInvitation = onAcceptInvitation;
function onRejectInvitation(socket, games) {
    return ({ playerId, roomId }) => __awaiter(this, void 0, void 0, function* () {
        socket.broadcast.to(playerId).emit("user:rejectsInvitation", true);
        socket.leave(playerId);
    });
}
exports.onRejectInvitation = onRejectInvitation;
function onUserConnected(socket, games) {
    return (room) => __awaiter(this, void 0, void 0, function* () {
        // get roomId
        const roomId = socket.roomId || room;
        // find game from game[] with roomId
        const game = games.find(game => game.roomId === roomId);
        if (!game)
            return;
        // identify current user and set ready status to true
        if (game.userA.userId === socket.userId) {
            game.userA.ready = true;
        }
        else {
            game.userB.ready = true;
        }
        if (game.userA.ready && game.userB.ready) {
            // get random number inbetween 0 and 1 to determine player X and O
            const number = Math.floor(Math.random() * 2);
            // set game.playerX and game.playerO
            if (number) {
                game.playerX = game.userA.userId;
                game.playerO = game.userB.userId;
            }
            else {
                game.playerX = game.userB.userId;
                game.playerO = game.userA.userId;
            }
            // set current player to player X
            game.currentPlayer = game.playerX;
            socket.emit('game:start', game);
            socket.to(roomId).emit('game:start', game);
        }
    });
}
exports.onUserConnected = onUserConnected;
function onPlayerMove(socket, games) {
    return (move) => __awaiter(this, void 0, void 0, function* () {
        // get roomId
        const roomId = socket.roomId;
        // find game from game[] with roomId
        const game = games.find(game => game.roomId === roomId);
        if (!game)
            return;
        // extract current board
        let currentBoard = game.history.slice(game.history.length - 1)[0];
        // create new board from the current board
        let newBoard = currentBoard.slice();
        // detemine player move x or o, then insert board
        newBoard[move] = (game.round % 2 === 0) ? "X" : "O";
        game.round += 1;
        // toggle current player between playerX and playerO;
        game.currentPlayer = (game.currentPlayer === game.playerX) ? game.playerO : game.playerX;
        // push array to history
        game.history.push(newBoard);
        // check for winners
        let winner = checkWinner(newBoard);
        let val = winner.winner;
        console.log(winner);
        if (val === "X" || val === "x" || val === "O" || val === "o") {
            socket.emit("game:playerMove", game);
            socket.emit("game:winner", winner);
            socket.to(roomId).emit("game:playerMove", game);
            socket.to(roomId).emit("game:winner", winner);
        }
        else {
            // emit updated board to sender and receiver 
            socket.emit("game:playerMove", game);
            socket.to(roomId).emit("game:playerMove", game);
        }
    });
}
exports.onPlayerMove = onPlayerMove;
function checkWinner(board) {
    const winningMoves = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    let winner = {
        winner: '',
        tiles: [],
    };
    winningMoves.forEach(move => {
        const [a, b, c] = move;
        if (board[a] && board[a] == board[b] && board[a] === board[c]) {
            console.log(board[a]);
            console.log(board[b]);
            console.log(board[c]);
            winner.winner = board[a];
            winner.tiles.push(a, b, c);
        }
    });
    if (winner.winner) {
        return winner;
    }
    return {
        winner: '',
        tiles: []
    };
}
function onPlayerWins() {
    return (playerId) => __awaiter(this, void 0, void 0, function* () {
        return;
    });
}
exports.onPlayerWins = onPlayerWins;
function onUserDisconnect(socket) {
    return () => __awaiter(this, void 0, void 0, function* () {
        yield (0, user_usecase_1.setOnlineStatus)(socket.userId, false);
    });
}
exports.onUserDisconnect = onUserDisconnect;
