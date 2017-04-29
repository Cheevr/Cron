const EventEmitter = require('events');

class TestTask extends EventEmitter {
    constructor(Runner) {
        super();
        Runner.job({ name: 'testJob', once: true }, context => {
            context.resolve();
            this.emit('done', this);
        });
    }
}

module.exports = TestTask;
