const socketioJwt = require("socketio-jwt");
const User = require("../models/user.model");
const secret = require('../config').secret;
const Game = require('../models/game.js');
const states = require('../models/helper/states.js');

/**
 *  Explanation of data structures and data handling:
 * `rooms` stores all the data about currently existing rooms, after the host left a room or closed the room the
 * whole room ends and is deleted from this dictionary
 * `socketInRoom` stores the connection of a socket to a roomId called `partyCode` and the immutable `userName`
 * associated to this socket (as opposed to socket.userName which represents the changing userName when a user
 * disconnects temporarily)
 * `socket` (object passed around through most of the class) is the socket object received by socket-io on every
 * event that our socket server (which is called `io`) listens to. It is identified by `socket.id` and stores the
 *  user name in `socket.userName` which is displayed in the frontend (it is: original username[ + `awayTagOnName`])
 */
class SocketController {

    constructor(io) {
        // Register a callback function to run when we have an individual connection
        // This is run for each individual user that connects
        io.sockets.on('connection', socketioJwt.authorize({
            secret: secret,
            timeout: 15000 // 15 seconds to send the authentication message
        }))
            .on('authenticated', (socket) => this.onUserAuthenticated(socket)
            );

        this.io = io;
    }
    maxAmountOfRooms = 10000;
    minutesToDisconnect = 0.25;
    awayTagOnName = " (away)";
    minutesOnBlacklist = 1;
    serverSocketObj = { id: "server", name: "server" };
    // Configuration values
    // used for logging that the server invoked this action

    rooms = {
        123456: {
            name: "Example room",
            started: false,
            players: [
                { name: "player1" },
                { name: "player2" },
                { name: "player3" },
                { name: "player4" },
                { name: "player5" },
                { name: "player6" },
                { name: "player7" },
                { name: "player8" },
                { name: "player9" },
                { name: "player10" },
                { name: "player11" },
                { name: "player12" },
                { name: "player13" },
            ],
            votes: [{ name: "tim", vote: "A" }, { name: "franz", vote: "B" }, { name: "filip", vote: "A" }, { name: "max", vote: "B" }],
            game: {},
            host: "admin",
            blacklist: []
        }

    };
    socketInRoom = {};

    /// Eventlisteners
    // Logs a new authenticeted socket and subscribes it to all important events
    onUserAuthenticated(socket) {
        console.log("New user " + socket.decoded_token.name + " was authenticated in the lobby with socket " + socket.id);

        socket.on('identify', (userName, callback) => this.onUserIdentified(userName, callback, socket));
        socket.on('createRoom', (roomName, callback) => this.onRoomCreate(roomName, callback, socket));
        socket.on('joinRoom', (partyCode, callback) => this.onUserJoined(partyCode, callback, socket));
        socket.on('userJoinedAndReady', (partyCode, userName) => this.onUserJoinedAndReady(partyCode, userName, socket));
        socket.on('startGame', (partyCode) => this.onGameStart(partyCode, socket));
        socket.on('vote', (vote) => this.onUserVotes(vote, socket));
        socket.on('nextTask', (callback) => this.onNextTask(callback, socket));
        socket.on('endGame', (partyCode, msg) => this.onGameEnd(partyCode, msg, socket)); // TODO: no emit in frontend yet, but could be used for game logic, can be deleted otherwise
        socket.on('kickUser', (userName, partyCode) => this.onUserKick(userName, partyCode, socket));
        socket.on('endRoom', (partyCode) => this.onRoomEnd(partyCode, "Room was closed by the host", socket));
        socket.on('leaveRoom', (partyCode) => this.onLeaveRoom(partyCode, socket));
        socket.on('disconnect', () => this.onUserDisconnect(socket));
        socket.on('isHost', (partyCode, userName, callback) => this.isHost(partyCode, userName, callback));
        socket.on('sendGift',(vote) =>{this.onUserVotes(vote, socket)})

    }

    onUserVotes(vote, socket) {
        if (!this.socketInRoom[socket.id]) {
            console.log("Attempted vote by socket that isn't in the room: " + socket.id + ", name: " + socket.userName);
            return;
        }

        let partyCode = this.socketInRoom[socket.id].partyCode;
        let name = socket.userName;
        let room = this.rooms[partyCode];
        console.log("User " + name + " voted:");
        console.log(vote);
        for (let i = 0; i < room.votes.length; i++)
            if (room.votes[i].name === vote.name) return;

        room.votes.push(vote);
        //next round
        this.attemptToStartNextRound(partyCode);
    }


    attemptToStartNextRound(partyCode) {
        try {
            let room = this.rooms[partyCode];
            if (room) {
                if (room.players.length === room.votes.length) {
                    let currentState = this.rooms[partyCode].game.states.currentState;
                    let response = room.game.getResponse(room.votes);
                    if (response) {
                        if (currentState === states.santaResult) {
                            console.log(response);
                            this.io.to(partyCode).emit("santasDelivery",response)
                        } else {
                            this.io.to(partyCode).emit("resultEvaluated", response.txt);
                        }
                        this.rooms[partyCode].lastTasks = response;
                    }
                    room.votes = [];
                }
            }
        } catch (error) {
            console.log("Error when starting next round " + error);
        }
    }

    onNextTask(callback, socket) {
        if(this.socketInRoom[socket.id] === undefined){
            callback(false);
            return;
        }
        let partyCode = this.socketInRoom[socket.id].partyCode;
        let name = socket.userName;
        let room = this.rooms[partyCode];
        console.log("User " + name + " in room " + partyCode + " is ready for the next task.");
        room.votes.push({ name: name });
        if (room.players.length === room.votes.length) {
            let currentState = this.rooms[partyCode].game.states.currentState;
            console.log(currentState);
            let task = this.rooms[partyCode].game.getResponse(null);
            this.rooms[partyCode].lastTasks = task;
            console.log("Next task was sent out to room " + partyCode + ":");
            console.log(task);
            if (currentState === states.santaStated){
                this.io.to(partyCode).emit("secretSanta", task);
            }else{
                this.io.to(partyCode).emit("task", task);
            }
            room.votes = [];
        }
    }

    /**
     * Sends `gameStarted` event to all players of room `partyCode` and starts the game in the backend by invoking the
     * function `startGame(sockets: socket-io.Namespace, partyCode: Number, players: [{name: String}], userName: String)`
     *
     * @param partyCode
     * @param socket
     */
    onGameStart(partyCode, socket) {
        if (socket.userName === undefined) {
            console.log("attempt to start game with undefined name");
            return;
        }
        console.log("Lobby started by " + socket.userName);
        this.rooms[partyCode].started = true;
        this.io.to(partyCode).emit("gameStarted");
        this.startGame(this.io.to(partyCode), partyCode);
    }

    /** Game function
     * with `sockets.emit(eventName: String[, ...args: any]` all connected players of the game will get an event in the
     * app (only if they also subscribed to it with `socket.on(eventName: String[, callback: function]`).
     * The socket object should be given via props to the game component.
     *
     * @param sockets
     * @param partyCode
     */
    startGame(sockets, partyCode) {
        console.log("Game in room " + partyCode + " starts.");
        let players2 = [];
        this.rooms[partyCode].players.forEach((a) => { players2.push(a.name) });
        this.rooms[partyCode].game = new Game(players2);
        let task = this.rooms[partyCode].game.getResponse(null);
        this.rooms[partyCode].lastTasks = task;
        console.log(task);
        sockets.emit("task", task);
    }

    /**
     * Identifies a connecting user by checking the database if the user has a recent socket associated with himself
     * to enable a reconnection to that room (possible until `minutesToDisconnect` minutes after a disconnect
     *
     * @param userName
     * @param cb
     * @param socket
     * @returns {Promise<void>}
     */
    async onUserIdentified(userName, cb, socket) {
        // check whether `userName` is valid and if it has a socket associated to it, load the previously joined room
        // and push the new socket on the update array of that room
        const filter = { name: userName };
        try {
            let user = await User.findOne(filter);
            let currentRoom;

            if (user.socket) {
                currentRoom = this.findCurrentRoom(user.socket);
                console.log(user.name + " reconnected with new socket " + socket.id);

                // If this user reconnected within `minutesToDisconnect` minutes

                if (currentRoom) {
                    this.cleanSocketInRoomConnection(user.socket);
                    socket.join(currentRoom);
                    socket.userName = user.name + this.awayTagOnName;
                    this.socketInRoom[socket.id] = { partyCode: currentRoom, userName: user.name };
                    this.updateNameInRoom(socket, false);
                    this.attemptToStartNextRound(currentRoom);
                    setTimeout(() => {
                        try {
                            let room = this.rooms[currentRoom];
                            if (room.started) {
                                console.log("Sending tasks to reconnected user: " + socket.userName);
                                socket.emit('roomUpdate', room.players, room.started, room.name);
                                switch (room.game.states.getPriorState()) {
                                    case states.taskStating:
                                        socket.emit("task", room.lastTasks);
                                        break;
                                    case states.taskResult:
                                        socket.emit("resultEvaluated", room.lastTasks.txt);
                                        break;
                                    case states.santaStated:
                                        socket.emit("secretSanta", room.lastTasks);
                                        break;
                                    case states.santaResult:
                                        socket.emit("santasDelivery", room.lastTasks);
                                        break;
                                    default:
                                        console.log("Error in getting the current state of the game. Should definitely not happen!!!!");
                                }
                                if (room.game.states.getCurrentState() === states.santaResult){
                                } else {
                                }
                                console.log("sent the tasks");
                            }
                        } catch (error) {
                            console.log("Error while sending tasks to reconnected user: " + error);
                        }
                    }, 100)
                }

            } else {
                currentRoom = null;
                socket.userName = user.name;
            }
            user.socket = socket.id;
            user.save();
            cb(currentRoom);
        } catch (error) {
            console.log("Critical error occurred while identifying user! This will probably lead to unstable socket " +
                "behaviour and should be fixed ASAP! Error is: " + error);
        }
    }

    /**
     *  Creates a new room with a `partyCode` between 0 and "maxAmountOfRooms", subscribes to the room updates and
     * responds to the frontend with the `partyCode`
     *
     * @param roomName
     * @param cb
     * @param socket
     */
    onRoomCreate(roomName, cb, socket) {
        console.log("Create room by " + socket.id);
        let partyCode;
        do
            partyCode = Math.floor(Math.random() * this.maxAmountOfRooms);
        while (this.rooms[partyCode]);
        this.rooms[partyCode] = {
            name: roomName,
            started: false,
            players: [{ name: socket.userName }],
            host: socket.userName,
            votes: [],
            blacklist: []
        };
        socket.join(partyCode);
        cb(partyCode);
    }

    /**
     * Decides whether a new user can join a room (the room has to exist, the user can't be on the blacklist, the room
     * can't have started and can't have the same user name in the room already), subscribes an allowed user to the
     * room updates and pushes his name to the room name list
     * @param partyCode
     * @param cb
     * @param socket
     */
    onUserJoined(partyCode, cb, socket) {
        console.log(socket.id + " wants to join room " + partyCode);
        if (this.rooms[partyCode]) {
            if (this.rooms[partyCode].blacklist.filter((player) => player.name === socket.userName).length === 0) {
                if (!this.rooms[partyCode].started) {
                    if (!this.hasDuplicateUsername(partyCode, socket)) {
                        socket.join(partyCode);
                        this.rooms[partyCode].players.push({ name: socket.userName });
                        cb({ success: true, msg: "" });
                    } else {
                        this.onDuplicateUsername(partyCode, socket.userName);
                        cb({ success: false, msg: "You are already in this room. Maybe you are still logged in on another device?" });
                    }
                } else {
                    cb({ success: false, msg: "This party has already started." });
                }
            } else {
                cb({ success: false, msg: "You are blocked from entering this room.\nTry not to get kicked next time." });
            }
        } else {
            cb({ success: false, msg: "There isn't any party happening under this code." });
        }
    }

    /**
     * User created or joined a room and everything is ready for an update to all players in the room
     * @param partyCode
     * @param userName
     * @param socket
     */
    onUserJoinedAndReady(partyCode, userName, socket) {
        console.log("this.socketInRoom[" + socket.id + "]: " + partyCode + " " + userName);
        this.socketInRoom[socket.id] = { partyCode: partyCode, userName: userName };
        console.log(this.socketInRoom[socket.id]);
        this.updateRoom(partyCode);
    }

    onGameEnd(partyCode, msg, socket) {
        try {
            this.rooms[partyCode].started = false;
            this.io.to(partyCode).emit("gameEnded", msg);
        } catch (error) {
            console.log("onGameEnd ERROR: " + error);
        }

    }

    /**
     * Looks for the socket of the user with `userName` in room `partyCode` to unsubscribe the socket from all room
     * updates, sends it a `gotKicked` event and cleans up
     *
     * @param userName
     * @param partyCode
     * @param socket
     */
    onUserKick(userName, partyCode, socket) {
        console.log("User " + userName + " kicked by " + socket.id);
        try {
            let socketsInRoom = this.io.sockets.adapter.rooms[partyCode].sockets;
            for (let socketId in socketsInRoom) {
                if (this.socketInRoom[socketId].userName === userName) {
                    let socketToKick = this.io.sockets.connected[socketId];
                    socketToKick.leave(partyCode);
                    socketToKick.emit('gotKicked');
                    this.putOnBlacklist(partyCode, this.socketInRoom[socketId].userName);
                    this.cleanNameInRoom(socketToKick);
                    this.cleanSocketInRoomConnection(socketId);
                }
            }
            // Check whether room still exists, could be gone if host was removed by the server
            if (this.rooms[partyCode])
                this.updateRoom(partyCode);
        } catch (error) {
            console.log("onUserKick ERROR: " + error);
        }

    }

    /**
     * Sends `roomEnds` event to all players of room `partyCode` with message `msg`, cleans up the connections of
     * all the sockets in the `socketInRoom` dictionary and deletes the room in `rooms`
     *
     * @param partyCode
     * @param msg
     * @param socket
     */
    onRoomEnd(partyCode, msg, socket) {
        try {
            console.log("Received end for room " + partyCode + " by " + socket.id + " because of " + msg);
            this.io.to(partyCode).emit("roomEnds", msg);
            // Check if socket room even exists (was cleaned up by socket.io if host was the only member and timed out)
            if (this.io.sockets.adapter.rooms[partyCode]) {
                let socketsInRoom = this.io.sockets.adapter.rooms[partyCode].sockets;
                for (let socketId in socketsInRoom)
                    this.cleanSocketInRoomConnection(socketId);
            }
            console.log("Deleting room " + partyCode);
            delete this.rooms[partyCode];
        } catch (error) {
            console.log("onRoomEnd ERROR: " + error);
        }

    }

    /**
     * Unsubscribes socket from room updates, cleans up and updates the room if it still exists
     * @param partyCode
     * @param socket
     */
    onLeaveRoom(partyCode, socket) {
        console.log(socket.userName + " leaves room " + partyCode);
        try {
            if (this.rooms[partyCode].game)
                this.rooms[partyCode].game.removeUser(socket.userName);
        } catch (error) {
            console.log("onLeaveRoom ERROR1: " + error);
        }
        try {
            socket.leave(partyCode);
            socket.emit("roomEnds", "You left the room");
            this.cleanNameInRoom(socket);
            this.cleanSocketInRoomConnection(socket.id);
            if (this.rooms[partyCode])
                this.updateRoom(partyCode);
        } catch (error) {
            console.log("onLeaveRoom ERROR2: " + error);
        }

    }

    /**
     * Logs the occurence of this undesirable event and kicks the socket that currently connects to the room. As a
     * result both sockets are without a room
     *
     * @param partyCode
     * @param userName
     */
    onDuplicateUsername(partyCode, userName) {
        this.logDuplicateUsername(partyCode, userName);
        this.onUserKick(userName, partyCode, this.serverSocketObj);
    }

    /**
     * Invokes cleaning process if `socket` was authenticated and part of a room
     * @param socket
     */
    onUserDisconnect(socket) {
        console.log("Client has disconnected");
        if (socket.id && this.socketInRoom[socket.id] && this.socketInRoom[socket.id].partyCode)
            this.io.to(this.socketInRoom[socket.id].partyCode).emit("msg", "someone disconnected, they have " + (this.minutesToDisconnect*60) + " seconds to reconnect");

        try {
            if (socket.userName && this.socketInRoom[socket.id])
                this.cleanAfterDisconnect(socket);
        } catch (error) {
            console.log("onUserDisconnect ERROR: " + error);
        }
    }



    /** Helper functions
     * Returns the `partyCode` if an active room is found in the dictionary `socketInRoom` (`socketInRoom` only saves the
     * `partyCode` for `minutesToDisconnect` minutes and won't exist otherwise)
     * @param socketId
     * @returns {*}
     */
    findCurrentRoom(socketId) {
        if (this.socketInRoom[socketId]) {
            let partyCode = this.socketInRoom[socketId].partyCode;
            if (this.rooms[partyCode])
                return partyCode;
        }
        return null;
    }

    /**
     * Updates all subscribed sockets about the current room data
     * @param partyCode
     */
    updateRoom(partyCode) {
        let room = this.rooms[partyCode];
        console.log("RoomUpdate sent out for room " + partyCode + " with players " + room.players + " and started: " + room.started);
        console.log([{ partyCode: partyCode }, this.rooms[partyCode]]);
        console.log(room.players);
        this.io.to(partyCode).emit('roomUpdate', room.players, room.started, room.name);
    }

    isHost(partyCode, userName, cb) {
        if(this.rooms[partyCode] === undefined){
            console.log("Attempted to call isHost with invalid code");
            cb(false);
            return;
        }
        cb(this.rooms[partyCode].host === userName);
    }

    /**
     * Puts a `userName` on the blacklist of room `partyCode` and removes it again after `minutesOnBlacklist` minutes
     * @param partyCode
     * @param userName
     */
    putOnBlacklist(partyCode, userName) {
        this.rooms[partyCode].blacklist.push({ name: userName });
        setTimeout(
            () => {
                if (this.rooms[partyCode])
                    this.rooms[partyCode].blacklist = this.rooms[partyCode].blacklist.filter((player) => player.name !== userName);
            },
            this.minutesOnBlacklist * 60000
        );
    }

    /**
     * Only invoked if `socket` belongs to a room i.e. has a partyCode
     * Deletes the room connection of a socket and the user name after `minutesToDisconnect` minutes after it
     * disconnected (it waits to permit the user to reconnect via a different socket in the timeframe)
     *
     * @param socket
     */
    cleanAfterDisconnect(socket) {
        let sid = socket.id;
        let partyCode = this.socketInRoom[socket.id].partyCode;
        let oldName = this.socketInRoom[socket.id].userName;
        if (partyCode && this.rooms[partyCode]) {
            this.updateNameInRoom(socket, true);
            this.updateRoom(partyCode);
            console.log("Name was updated from " + oldName + " to " + socket.userName + ".");
        }
        setTimeout(
            async () => {
                try {
                    if (!this.socketInRoom[sid]) return;
                    if (this.rooms[partyCode].game && this.rooms[partyCode].started)
                        this.rooms[partyCode].game.removeUser(socket.userName);


                    this.cleanSocketDBConnection(socket);
                    this.cleanNameInRoom(socket);
                    this.cleanSocketInRoomConnection(sid);
                    console.log("Removing the room connection of " + socket.userName);
                    this.attemptToStartNextRound(partyCode);
                } catch (error) {
                    console.log("The user joined back at some point. Error: " + error);
                }

            },
            this.minutesToDisconnect * 60000
        )

    }

    /**
     * Updates the corresponding username of `socket` with adding or subtracting `awayTagOnName` depending on `isAway`
     * @param socket
     * @param isAway
     */
    updateNameInRoom(socket, isAway) {
        try {
            let players = this.rooms[this.socketInRoom[socket.id].partyCode].players;
            for (let index in players) {
                if (players[index].name === socket.userName)
                    isAway ?
                        players[index].name = players[index].name + this.awayTagOnName :
                        players[index].name = players[index].name.slice(0, players[index].name.length - this.awayTagOnName.length);
            }
            if (isAway)
                socket.userName = socket.userName + this.awayTagOnName;
        } catch (error) {
            console.log("updateNameInRoom ERROR " + error);
        }

    }

    /**
     * Removes the corresponding username of `socket` from it's current room `partyCode` and updates it's players
     * if it has a current room and that room exists.
     * If the corresponding user of `socket` is the host, it deletes the whole room.
     *
     * @param socket
     */
    cleanNameInRoom(socket) {
        try {
            if (this.socketInRoom[socket.id]) {
                let partyCode = this.socketInRoom[socket.id].partyCode;
                if (this.rooms[partyCode]) {
                    if (this.rooms[partyCode].host === this.socketInRoom[socket.id].userName) {
                        this.onRoomEnd(partyCode, "Inactivity of host", socket);
                    } else {
                        this.rooms[partyCode].players = this.rooms[partyCode].players.filter((player) => player.name !== socket.userName);
                        this.updateRoom(partyCode);
                    }
                }
            }
        } catch (error) {
            console.log("cleanNameInRoom ERROR " + error);
        }

    }

    /**
     * Deletes entry for `socketId` in `socketInRoom` dictionary
     * @param socketId
     */
    cleanSocketInRoomConnection(socketId) {
        delete this.socketInRoom[socketId];
    }

    /**
     * Removes socket id from corresponding user if any user still has this socket referenced
     * @param socket
     * @returns {Promise<void>}
     */
    async cleanSocketDBConnection(socket) {
        try {
            let user = await User.findOne({ socket: socket.id });
            user.socket = null;
            user.save();
        } catch (error) {
            // do nothing, user has moved on to another socket
        }
    }

    /**
     * Returns true if there is a user inside the room `partyCode` with the same user name as `socket.userName`
     *
     * @param partyCode
     * @param socket
     * @returns {boolean}
     */
    hasDuplicateUsername(partyCode, socket) {
        return this.rooms[partyCode].players.filter((player) => player.name === socket.userName).length !== 0;
    }

    /**
     * Logs to console a visible comment about a duplicate user name error (it should only rarely happen or
     * authentication needs to be reworked)
     *
     * @param partyCode
     * @param userName
     */
    logDuplicateUsername(partyCode, userName) {
        console.log("----------------------------------------------");
        console.log("Error with two equal user names has happened!!");
        console.log("userName: " + userName + ", partyCode: " + partyCode);
        console.log("----------------------------------------------");
    }
}

module.exports = SocketController;
