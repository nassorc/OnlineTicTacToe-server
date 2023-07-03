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
const socket_io_1 = require("socket.io");
const socket_controller_1 = require("./controller/socket.controller");
const socketAttachUser_1 = __importDefault(require("./middleware/socketAttachUser"));
const user_usecase_1 = require("./usecase/user.usecase");
const gameStatus = [];
const games = [];
function socket(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
        }
    });
    io.use(socketAttachUser_1.default);
    io.on("connection", (socket) => {
        socket.join(socket.userId);
        (function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, user_usecase_1.setOnlineStatus)(socket.userId, true);
            });
        })();
        socket.on("user:invitePlayer", (0, socket_controller_1.onInvitePlayer)(socket));
        socket.on("user:acceptInvitation", (0, socket_controller_1.onAcceptInvitation)(socket, games));
        socket.on("user:rejectInvitation", (0, socket_controller_1.onRejectInvitation)(socket, games));
        socket.on("game:connected", (0, socket_controller_1.onUserConnected)(socket, games));
        socket.on("game:playerMove", (0, socket_controller_1.onPlayerMove)(socket, games));
        socket.on("game:winner", socket_controller_1.onPlayerWins);
        socket.on("disconnect", (0, socket_controller_1.onUserDisconnect)(socket));
    });
}
exports.default = socket;
