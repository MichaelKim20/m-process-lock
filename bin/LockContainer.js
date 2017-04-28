"use strict";
var redis = require('redis');
var LockWatch = require('./LockWatch');

class LockContainer {
    constructor(option) {
        this.option = option;
        this.client = redis.createClient(this.option.port, this.option.host);
        this.items = new Array(0);
        this.client.on('error', () => {
            this.client.end(true);
            this.client = redis.createClient(this.option.port, this.option.host);
        });

        this.localKeys = [];
    }

    static getInstance(option) {
        if (LockContainer.instance == null) {
            LockContainer.instance = new LockContainer(option);
        }
        return LockContainer.instance;
    }

    addLock(key) {
        if (this.items[key] == null) {
            this.items[key] = new LockWatch(this.client, key);
        }
    };

    removeLock(key) {
        if (this.items[key] != null) {
            this.items[key].stop();
            delete this.items[key];
        }
    };

    removeAll() {
        for (var key in this.items) {
            if (this.items[key] != null) {
                this.items[key].stop();
            }
        }
        this.items = new Array(0);
    }

    dispose() {
        for (var key in this.items) {
            if (this.items[key] != null) {
                this.items[key].stop();
            }
        }
        this.items = new Array(0);

        this.client.end(true);
    }

    enter(key, callback) {
        var key_lock = '$' + key;
        var key_loop = '$' + key + '_lock_loop';
        var key_enter = '$' + key + '_enter';

        this.client.incr(key_loop, (err, data) => {
            var tick;
            if (data == null) tick = 0;
            else tick = data;
            if (data > 10000) {
                this.client.set(key_loop, 0);
            }
            tick = (tick % 10);
            var oldDateTime, newDateTime, newtick, oldtick;
            oldDateTime = new Date();
            var container = this;
            var go_enter = function () {
                newDateTime = new Date();
                newtick = Math.trunc((newDateTime.getTime() + tick * 10) / 100);
                oldtick = Math.trunc((oldDateTime.getTime() + tick * 10) / 100);
                oldDateTime = newDateTime;

                if (newtick != oldtick) {
                    container.client.incr(key_lock, (err, data) => {
                        if (err) {
                            callback(false);
                            return;
                        }
                        if (data == 1) {
                            container.client.set(key_enter, (new Date()).getTime());
                            callback(true);
                            return;
                        }
                        container.client.decr(key_lock, (err, data) => {
                            setTimeout(go_enter, 10);
                        });
                    });
                } else {
                    setTimeout(go_enter, 10);
                }
            };
            go_enter();
        });
    }

    leave(key) {
        var key_lock = '$' + key;
        this.client.decr(key_lock);
    }

}
LockContainer.instance = null;

module.exports = LockContainer;
