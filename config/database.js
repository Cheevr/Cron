module.exports = {
    tasks: {
        logger: 'tasks',
        client: {
            host:'localhost:9200',
        },
        indices: {
            status: {
                mappings: {
                    task: {
                        properties: {
                            host: {type: 'keyword'},
                            file: {
                                type: 'text',
                                analyzer: 'ngram_analyzer',
                                fields: {
                                    raw: { ignore_above: 64, type: 'keyword' }
                                }
                            },
                            workers: {type: 'short'},
                            enabled: {type: 'boolean'},
                            modified: {type: 'date'}
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
