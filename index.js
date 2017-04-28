"use strict";
var lc = require('./bin/LockContainer');

var option = {"host": "127.0.0.1", "port": 6379};

exports.setOption = function(op) {
    if (op != null) option = op;
};

exports.addLock = function(key) {
    lc.getInstance(option).addLock(key);
};

exports.removeLock = function(key) {
    lc.getInstance(option).removeLock(key);
};

exports.removeAll = function() {
    lc.getInstance(option).removeAll();
};

exports.enter = function(key, callback) {
    lc.getInstance(option).enter(key, callback);
};

exports.leave = function(key) {
    lc.getInstance(option).leave(key);
};

exports.client = function() {
    return lc.getInstance(option).client;
};

