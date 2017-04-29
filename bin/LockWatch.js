"use strict";

class LockWatch {
    constructor(client, key) {
        this.client = client;
        this.key = '$' + key;
        this.key_enter = '$' + key + '_enter';
        this.key_watch = '$' + key + '_watch';
        this.started = false;

        this.start();
    }

    start() {
        this.started = true;
        this.client.incr(this.key_watch, (err, data) => {
            var tick;
            if (data == null) tick = 0;
            else tick = data;
            if (data > 10000) {
                this.client.set(this.key_watch, 0);
            }
            tick = (tick % 10);

            var oldDateTime, newDateTime, newtick, oldtick;
            oldDateTime = new Date();
            var watcher = this;
            var go_watch = function () {

                newDateTime = new Date();
                newtick = Math.trunc((newDateTime.getTime() + tick * 100) / 1000);
                oldtick = Math.trunc((oldDateTime.getTime() + tick * 100) / 1000);
                oldDateTime = newDateTime;

                if (newtick != oldtick) {
                    watcher.client.get(watcher.key_enter, (err, data) => {
                        if (!err) {
                            var LNTime = new Date();
                            if (data == null) {
                                watcher.client.set(watcher.key_enter, LNTime.getTime());
                            } else {
                                var LElapse = (LNTime.getTime() - data) / 1000;

                                if (LElapse > 10) {
                                    watcher.client.set(watcher.key, 0);
                                    watcher.client.set(watcher.key_enter, LNTime.getTime());
                                }
                            }
                        }
                        if (watcher .started) setTimeout(go_watch, 100);
                    });
                } else {
                    if (watcher.started) setTimeout(go_watch, 100);
                }
            };
            go_watch();
        });
    };

    stop() {
        this.started = false;
    };

}

module.exports = LockWatch;
