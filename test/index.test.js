/* globals describe, it, after, afterEach, before, beforeEach */
const config = require('cheevr-config');
const expect = require('chai').expect;
const path = require('path');
const Tasks = require('..');


describe('Tasks', () => {
    it('should load tasks from the "tasks" directory', done => {
        config.paths.tasks = path.join(__dirname, 'tasks');
        Tasks.once('added', task => {
            expect(task.id).to.contain('TestTask.js');
            expect(Tasks.task(task.id)).to.deep.equal(task);
            done();
        });
        Tasks.reload();
    });

    it('should run a task once', done => {
        config.paths.tasks = [];
        Tasks.reload();
        let task = Tasks.addTask(path.join(__dirname, 'jobs/once.js'));
        // TODO communicate with task to get test results
    });

    it('should run a task at a given interval', () => {

    });

    it('should run a task using cron format', () => {

    });

    it('should report the task and job status to the database', () => {

    });
});
