const path = require('path');
const helper = require('./helper');

class Socket {
    constructor(socket) {
        this.io = socket;
    }

    socketEvents() {
        this.io.on('connection', (socket) => {
            socket.on('chat-list', (data) => {
                let chatListResponse = {}
                if (data.userId == '') {
                    chatListResponse.error = true;
                    chatListResponse.message = 'User does not exists.';

                    this.io.emit('chat-list-response', chatListResponse);
                } else {
                    helper.getUserInfo(data.userId, (err, UserInfoResponse) => {
                        delete UserInfoResponse.password;

                        helper.getChatList(socket.id, (err, response) => {
                            this.io.to(socket.id).emit('chat-list-response', {
                                error: false,
                                singleUser: false,
                                chatList: response
                            });

                            socket.broadcast.emit('chat-list-response', {
                                error: false,
                                singleUser: true,
                                chatList: UserInfoResponse
                            });
                        });
                    });
                }
            });

            socket.on('add-message', (data) => {
                if (data.message == '') {
                    this.io.to(socket.id).emit('add-message-response', 'Message cant be empty');
                } else if (data.formUserId === '') {
                    this.io.to(socket.id).emit('add-message-response', 'Unexpected error, Login again');
                } else if (data.toUserId === '') {
                    this.io.to(socket.id).emit('add-message-response', 'Select a user to chat');
                } else {

                    let toSocketId = data.toSocketId;
                    let fromSocketId = data.fromSocketId;
                    delete data.toSocketId
                    data.timestamp = Math.floor(new Date() / 1000);

                    helper.insertMessages(data, (error, response) => {
                        this.io.to(toSocketId).emit('add-message-response', data);
                    });
                }
            });

            socket.on('logout', (data) => {
                const userId = data.userId;
                helper.logout(userId, false, (error, response) => {
                    this.io.to(socket.id).emit('logout-response', {
                        error: false
                    });

                    socket.broadcast.emit('chat-list-response', {
                        error: false,
                        userDisconnected: true,
                        socketId: socket.id
                    });
                });
            });

            socket.on('disconnect', () => {
                socket.broadcast.emit('chat-list-response', {
                    error: flase,
                    userDisconnected: true,
                    socketId: socket.id
                });
            });

        });
    }

    socketConfig() {
        this.io.use(function(socket, next) {
            let userId = socket.request._query['userId'];
            let userSocketId = socket.id;
            const data = {
                id: userId,
                value: {
                    $set: {
                        socketId: userSocketId,
                        online: 'Y'
                    }
                }
            }

            helper.addSocketId(data, (error, message) => {
                //
            });
            next();
        });

        this.socketEvents();
    }
}
module.exports = Socket;