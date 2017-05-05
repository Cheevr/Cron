module.exports = exports = Runner => {
    Runner.job({
        name: 'Test Once Job',
        once: true
    }, context => context.resolve());
};
