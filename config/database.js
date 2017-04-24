module.exports = {
    tasks: {
        logger: 'tasks',
        client: {
            host:'localhost:9200',
        },
        indices: {
            tasks: {
                mappings: {
                    task: {
                        properties: {
                            host: {type: 'keyword'},
                            file: {type: 'text', analyzer: 'ngram_analyzer'},
                            workers: {type: 'short'},
                            enabled: {type: 'boolean'}
                        }
                    }
                },
                settings: {
                    analysis: {
                        filter: {
                            ngram_filter: {
                                type: 'nGram',
                                min_gram: 2,
                                max_gram: 50
                            }
                        },
                        analyzer: {
                            ngram_analyzer: {
                                type: 'custom',
                                tokenizer: 'standard',
                                filter: ['lowercase', 'ngram_filter']
                            }
                        }
                    },
                    index: {
                        number_of_shards: 4,
                        search: {
                            slowlog: {
                                threshold: {
                                    query: {
                                        warn: '10s',
                                        info: '5s',
                                        debug: '2s'
                                    },
                                    fetch: {
                                        warn: '1s',
                                        info: '800ms',
                                        debug: '500ms'
                                    }
                                }
                            }
                        },
                        indexing: {
                            slowlog: {
                                threshold: {
                                    index: {
                                        warn: '10s',
                                        info: '5s',
                                        debug: '2s'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
};