
var lock = require('redis-lock');

lock.setOption({"host": "172.30.1.252", "port": 6379});
lock.addLock('stock');

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

