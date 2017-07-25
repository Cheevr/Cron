# Cheevr-Tasks
[![npm version](https://badge.fury.io/js/%40cheevr%2Ftasks.svg)](https://badge.fury.io/js/%40cheevr%2Ftasks)
[![Build Status](https://travis-ci.org/Cheevr/Tasks.svg?branch=master)](https://travis-ci.org/Cheevr/Tasks)
[![Coverage Status](https://coveralls.io/repos/Cheevr/Tasks/badge.svg?branch=master&service=github)](https://coveralls.io/github/Cheevr/Tasks?branch=master)
[![Dependency Status](https://david-dm.org/Cheevr/Tasks.svg)](https://david-dm.org/Cheevr/Tasks)

# About

This library is designed to help dealing with recurring tasks running in multiple processes. It will help
you schedule one or more executions and help with inter process communication between tasks and the main
process. The module is designed to work with an express server (Take a look at
[@cheevr/server](https://github.com/cheevr/server) for an example) and offers some functionality
specifically for that use case, but the base system works just as fine as a standalone task manager.


## Installation

```Bash
npm i @cheevr/tasks
```

## Basic Example

To get started with running tasks we need to create a task. Create a file in named **tasks/mytask.js** and
use this content to get started:

```JavaScript
module.exports = Runner => {
    // Register a job with the task runner
    Runner.job({
        name: 'Test Job',
        interval: '10s',
    }, Context => {
        console.log('running my task');

        // Signal to the task runner that this task is done
        Context.resolve();
    });
};
```

There are 2 objects here that require a little attention. The ```Runner``` is a reference to the task manager
where all task metadata is stored and configured. This is where you register a new job for this task. One task
can have multiple jobs running. The difference being that each task is run in its own process, while jobs run
in the same (task) process. So if you have multiple operations that don't need their own process or need to
share memory/code access you can specify them as jobs.

The second object to look at is the ```Context```. This is the context in which a job is run an allows a job
to communicate with the task framework. In the example above the task is resolved as successful so that the
runner knows when to launch the next run (in this case 10s later). Right now there's only 2 methods available
in the context (```resolve``` and ```reject```) but in future updates more operations and information will
become available here.

Now you just need to include the task runner somewhere in your project. It will automatically scan the **tasks**
directory (can be changed via configuration) for tasks to execute and launch them:

```JavaScript
// index.js
require('@cheevr/tasks');
```

Your tasks should now run every 10 seconds.

# API

The majority of your interaction with the system will be by creating tasks as shown in the example above.
There are a few utility methods that will allow you to interact with the system when it's up and running

## Tasks.reload()

Reloads the entire task system and resets all timers. Currently running tasks will be interrupted with a
SIGKILL so make sure your tasks don't leave your system in an unusable state of they get terminated.

## Tasks.scanPath({string|string[]} taskPath)

Looks for task files in the given path(s) and runs them. You can either specify a single file or whole
directory. Note that if you specify a directory every javascript file in that directory is expected to
be a task. This method will not recurse down directories so if you have multiple subdirectories with
tasks you will have to add them all individually.

## Tasks.addTask({string} file)

Allows to add a single file as task file which will be launched immediately.

## Tasks.endpoint({Express.Router} router, {string} urlPath)

A helper class that will take an express router and a few endpoints with which you can monitor and
control tasks. The first parameter is the router/app on which the endpoint should be established.
The second parameter is a url prefix that can also be set via config file under the key
```tasks.urlPath``` and defaults to **/tasks**.

Here's a list of endpoints that are available. All enpoints take their parameters from the url:

#### <prefix>/status

Returns a map of all tasks and their states in JSON format.

#### <prefix>/<taskName>/enable

Allows to enable a task that has previously been disabled.

#### <prefix>/<taskName>/disable

Similar to the previous endpoint this one allows to disable an active task.

#### <prefix>/<taskName>/workers/<number>

Allows to set the number of workers a tasks is supposed to be running with.

#### <prefix>/<taskName>/trigger/<job>

Allows to trigger a job from a task to run immediately.

## Tasks.task({string} file);

Returns a reference to an existing task based on the filename that it was read from. This tasks
reference allows to communicate and control the task and jobs through an API that we will go into more
detail below:

### Task.broadcast.<method>(...args)

This will allow you to send a broadcast message to all running processes of a task. The broadcast
property is a proxy that will take any method name and arguments and send these to the tasks to be
called there. The method must exist in the target task as part of the Runner function.

To extend the example from above:

```JavaScript
// tasks/myTask.js
module.exports = exports = Runner => {};

exports.say = (greeting, who) => console.log('%s, %s!', greeting, who);
```

Now you can interact with the task like this:

```JavaScript
// index.js
const Tasks = require('@cheevr/tasks');
const myTask = Tasks.task('tasks/myTask.js');

myTask.boradcast.say('Hello', 'World');
```

This should let every process for this task print hello world. Note that depending on how you load the
tasks you might want to use absolute paths.

### Task.roundRobin.<method>(...args)

Same as the previous method, this one differs in that a message will only be sent to a single process at
a time. Calling the method multiple times will each time send the message to the next process until all
processes have received a message and then continue with the first.

### Task.ready()

An asynchronous method that returns a promise that will resolve once the task has loaded all processes and
is ready to be interacted with.

### Task.kill()

This will kill all processes running for a task and terminate the task.

### Task.enabled

A getter/setter that allows to enabled or disable a task.

### Task.id / Task.file

Returns a unique identifier for this task, which currently is the same as the tasks file name.

### Task.name

Returns the name of the task which is based on the filename it was create from

### Task.workersWanted

A getter/setter that allows to set how many processes are supposed to be active for a given task.


# Configuration

There are two locations for configuration - the config files under the config directory (see
[@cheevr/config](https://github.com/cheevr/config) for details) and the job configuration within
task files. The config files allow you to configure general options for the entire system, while
job options will allow you to tell the system how to run a job.

## Config File Options

The default location for the configuration file should be located under **config/default.json**.
These are the options available for configuration:

### tasks.enabled (boolean = true)

Whether the task system is enabled or not at startup can be configured right here.

### tasks.database (string = tasks)

The database name to use with the database module. By default the task metadata will be stored on
**localhost:9200** which you can configure using [@cheevr/database](https://github.com/cheevr/database).

### tasks.index (string = status)

The name of the index to use to store data in

### tasks.logger (string = tasks)

The name of the logger to use. For more information on how to configure logging check out
[@cheevr/logger](https://github.com/cheevr/logger).

### tasks.urlPath (string = /tasks)

The prefix to use when using the ```Tasks.endpoint()``` method

### tasks.memory (number = 256)

The memory in MB to allocate for each running process by default.

### paths.tasks (string = tasks)

The path in which to look for task files on launch, relative to the project working directory.

### defaults.tasks.waitForComplete (boolean = true)

Allows you to globally set whether tasks should wait for a task to finish before counting down to the
next run or whether **interval** jobs should just run at fixed intervals ignoring run time. This
setting can also be changed on a per task basis in the task configuration (see below).

### defaults.tasks.sleep (number = 0)

Allows to set a sleep timer between jobs being run, which includes a start up delay. Set this if you
have trouble with tasks spinning too often.

## Job Configuration

There are currently 3 types of jobs that you can configure The following are common options and the
below mentioned job type specific configurations

#### job.name (string = executor.name)

Allows to set a name for this job. If no name is given the function name will be used instead.
Note that if you use lambdas of anonymous functions you may not be able to interact with a job by
name later on.

#### job.sleep (number = defaults.tasks.sleep = 0)

This is the same option as in the defaults configuration for setting a minimum sleep duration between
job runs, here on the individual job level.

### job.once (boolean)

Setting this value to true will force a job to run only once. This is the simplest of jobs to run and
this will not trigger another run. Common use cases for such job could be setting up message queue
listeners and other processes that will trigger on external input.

```JavaScript
module.exports = exports = Runner => {
    Runner.job({
        name: 'Once Job Example',
        once: true
    }, context => context.resolve());
};
```

### job.interval (string|number)

If you want to run a job in a fixed interval this should be set to a number representing the time in ms
or a string that is compatible with moment.js (e.g. 10s, 5m, 1h, ...).

```JavaScript
module.exports = exports = Runner => {
    Runner.job({
        name: 'Interval Job Example',
        interval: '10ms',
    }, context => context.resolve());
};
```

#### job.waitForComplete (boolean = true)

When calculating the interval between 2 job runs you can wither wait for a job to complete before starting
to wait which leads to a dynamic interval time between runs, or you can set a fixed interval by running the
job at a fixed interval. This option allows to choose between these two modes. The default setting waits
for jobs to be completed before initiating the next countdown since that is the safer option adn prevents
overlaps of the same task.

### job.cron (string)

If neither ```job.once``` nor ```job.interval``` are set, you should set the job to run in cron intervals.
The passed in string should follow the standard cron format (e.g. "1 * * * *"). The parsing and triggering
of jobs is handled by the [later](http://bunkat.github.io/later/parsers.html#cron) module.

```JavaScript
module.exports = exports = Runner => {
    Runner.job({
        name: 'Cron Job Example',
        cron: '0 0/5 14 * *',
    }, context => context.resolve());
};
```

#### job.includesSeconds (boolean = false)

The standard cron format only allows granularity down to minutes. If this value is set to true, you can add
an additional value that will be interpreted as seconds.


# Future Features and Tasks for Consideration

* Allow configuration (such as memory allocation) per tasks
* Set database to use __default__ instance
* Automatically detect cron job granularity
