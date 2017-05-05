module.exports = Runner => {
    Runner.job({ name: 'testJob', once: true }, context => context.resolve());
};
