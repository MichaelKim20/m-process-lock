
var lock = require('../');

lock.setOption({"host": "172.30.1.252", "port": 6379});
lock.addLock('data');

setInterval(() => {
    lock.enter('data', (success) => {
        if (success) {
            console.info('O  ' + new Date());
            setTimeout(() => {
                console.info('X  ' + new Date());
                lock.leave('data');
            }, 1000);
        }
    })
}, 2000);

