class Helper {

    constructor() {
        this.Mongodb = require("./db");
    }

    userNameCheck(data, callback) {
        this.Mongodb.onConnect((db, ObjectID) => {
            db.collection('users').find(data).count((err, result) => {
                db.close();
                callback(result);
            });
        });
    }

    login(data, callback) {
        this.Mongodb.onConnect((db, ObjectID) => {
            db.collection('users').findAndModify(data, [], { $set: { 'online': 'Y' } }, {}, (err, result) => {
                db.close();
                callback(err, result.value);
            });
        });
    }

    registerUser(data, callback) {
        this.Mongodb.onConnect((db, ObjectID) => {
            db.collection('users').insertOne(data, (err, result) => {
                db.close();
                callback(err, result);
            });
        });
    }

    userSessionCheck(data, callback) {
        this.Mongodb.onConnect((db, ObjectID) => {
            db.collection('users').findOne({ _id: ObjectID(data.userId), online: 'Y' }, (err, result) => {
                db.close();
                callback(err, result);
            });
        });
    }

    getUserInfo(userId, callback) {
        this.Mongodb.onConnect((db, ObjectID) => {
            db.collection('users').findOne({ _id: ObjectID(userId) }, (err, result) => {
                db.close();
                callback(err, result);
            });
        });
    }

    addSocketId(data, callback) {
        this.Mongodb.onConnect((db, ObjectID) => {
            db.collection('users').update({ _id: ObjectID(data.id) }, data.value, (err, result) => {
                db.close();
                callback(err, result.result);
            });
        });
    }

    getChatList(userId, callback) {
        this.Mongodb.onConnect((db, ObjectID) => {
            db.collection('users').find({ 'online': 'Y', socketId: { $ne: userId } }).toArray((err, result) => {
                db.close();
                callback(err, result);
            });
        });
    }

    insertMessages(data, callback) {
        this.Mongodb.onConnect((db, ObjectID) => {
            db.collection('messages').insertOne(data, (err, result) => {
                db.close();
                callback(err, result);
            });
        });
    }

    getMessages(userId, toUserId, callback) {

        const data = {
            '$or': [{
                '$and': [{
                    'toUserId': userId
                }, {
                    'fromUserId': toUserId
                }]
            }, {
                '$and': [{
                    'toUserId': toUserId
                }, {
                    'fromUserId': userId
                }]
            }, ]
        };
        this.Mongodb.onConnect((db, ObjectID) => {
            db.collection('messages').fin(data).sort({ 'timestamp': 1 }).toArray((err, result) => {
                db.close();
                callback(err, result);
            });
        });
    }

    logout(userId, isSocketId, callback) {
        const data = {
            $set: {
                online: 'N'
            }
        };
        this.Mongodb.onConnect((db, ObjectID) => {
            let condition = {};
            if (isSocketId) {
                condition.socketId = userId;
            } else {
                condition_id = ObjectID(userId);
            }

            db.collection('users').update(condition, data, (err, result) => {
                db.close();
                callback(err, result);
            });
        });
    }
}
module.exports = new Helper();