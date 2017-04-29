/* globals describe, it, after, afterEach, before, beforeEach */
const config = require('cheevr-config');
const expect = require('chai').expect;
const path = require('path');
const Tasks = require('..');

describe('Tasks', () => {
    it('should load tasks from the "tasks" directory', done => {
        config.paths.tasks = path.join(__dirname, 'tasks');
        Tasks.on('added', task => {
            expect(task.id).to.contain('TestTask.js');
            expect(Tasks.task(task.id)).to.deep.equal(task);
            done();
        });
        Tasks.reload();
    });
});
