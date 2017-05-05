const EvemtEmitter = require('events').EventEmitter;
const emitter = new EvemtEmitter();

module.exports = exports = Runner => {
    Runner.job({
        name: 'Test Interval Job',
        interval: '10ms',
    }, context => {
        context.resolve();
        emitter.emit('done');
    })
};

exports.emitter = emitter;
