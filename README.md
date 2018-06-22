
[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![NPM version][npm-image]][npm-url]

# Mongoose Model Cache

> Collection level batching and caching for mongoose queries, powered by es6 proxies.

# Usage

```ts

import mongoose from 'mongoose';
import modelCache from 'mongoose-model-cache';

// configure a schema somewhere
const schema = new mongoose.Schema({
  name: { type: String }
});

// register it to mongoose
const Cat = mongoose.model('Cat', schema);

const CatCache = modelCache(Cat, {
    ttl: 5000 // cache for 5 seconds
});

(async () => {
    const cats = await CatCache.find();
    console.log(cats);
})();

// optionally, replace global instance
mongoose.models['Cat'] = CatCache;

```

## Supported Methods:
- find
- findOne
- findById
- count

[npm-image]: https://badge.fury.io/js/mongoose-model-cache.svg
[npm-url]: https://npmjs.org/package/mongoose-model-cache
[downloads-url]: https://www.npmjs.com/package/mongoose-model-cache
[downloads-image]: https://img.shields.io/npm/dm/mongoose-model-cache.svg?style=flat
[travis-image]: https://travis-ci.com/blugavere/mongoose-model-cache.svg?branch=master
[travis-url]: https://travis-ci.com/blugavere/mongoose-model-cache
[coveralls-image]: https://coveralls.io/repos/blugavere/mongoose-model-cache/badge.svg
[coveralls-url]: https://coveralls.io/r/blugavere/mongoose-model-cache